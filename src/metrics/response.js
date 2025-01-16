const copy = require("lodash/cloneDeep")
const { OpenPAYGOMetricsShared } = require("./metrics")

class MetricsResponseHandler {
  constructor(
    receivedMetrics,
    dataFormat = null,
    secretKey = null,
    lastRequestCount = null,
    lastRequestTimestamp = null
  ) {
    this.receivedMetrics = receivedMetrics
    this.request = JSON.parse(receivedMetrics)

    this.request = OpenPAYGOMetricsShared.convertObjectKeysToSimple(
      this.request
    )

    // Add the reception timestamp if no timestamp was provided
    this.requestTimestamp = this.request.timestamp || null
    this.timestamp = this.requestTimestamp
      ? this.request.timestamp
      : Math.floor(Date.now() / 1000)

    this.response = {}
    this.secretKey = secretKey
    this.dataFormat = dataFormat
    this.lastRequestCount = lastRequestCount
    this.lastRequestTimestamp = lastRequestTimestamp

    if (!this.dataFormat && this.request.data_format) {
      this.dataFormat = this.request.data_format
    }
  }

  getDeviceSerial() {
    return this.request.serial_number
  }

  getDataFormatId() {
    return this.request.data_format_id
  }

  dataFormatAvailable() {
    return this.dataFormat !== null
  }

  setDeviceParameters({
    secretKey = null,
    dataFormat = null,
    lastRequestCount = null,
    lastRequestTimestamp = null,
  }) {
    if (secretKey) this.secretKey = secretKey
    if (dataFormat) this.dataFormat = dataFormat
    if (lastRequestCount) this.lastRequestCount = lastRequestCount
    if (lastRequestTimestamp) this.lastRequestTimestamp = lastRequestTimestamp
  }

  isAuthValid() {
    const authString = this.request.auth || null
    if (!authString) return false
    if (!this.secretKey) {
      throw new Error("Secret key is required to check the auth.")
    }

    this.authMethod = authString.slice(0, 2)
    const newSignature =
      OpenPAYGOMetricsShared.generateRequestSignatureFromData(
        this.request,
        this.authMethod,
        this.secretKey
      )

    if (authString === newSignature) {
      const requestCount = this.getRequestCount()
      if (
        requestCount &&
        this.lastRequestCount &&
        requestCount <= this.lastRequestCount
      ) {
        return false
      }
      const timestamp = this.getRequestTimestamp()
      if (
        timestamp &&
        this.lastRequestTimestamp &&
        timestamp <= this.lastRequestTimestamp
      ) {
        return false
      }
      return !!(requestCount || timestamp)
    }
    return false
  }

  getSimpleMetrics() {
    const simpleObject = copy(this.request)
    if ("auth" in simpleObject) delete simpleObject.auth

    simpleObject.data = this._getSimpleData()
    simpleObject.historical_data = this._getSimpleHistoricalData()
    simpleObject.historical_data = this._fillTimestampInHistoricalData(
      simpleObject.historical_data
    )

    return simpleObject
  }

  getDataTimestamp() {
    return this.request.data_collection_timestamp || this.timestamp
  }

  getRequestTimestamp() {
    return this.requestTimestamp
  }

  getRequestCount() {
    return this.request.request_count
  }

  getTokenCount() {
    const data = this._getSimpleData()
    return data.token_count || null
  }

  expectsTokenAnswer() {
    return this.getTokenCount() !== null
  }

  addTokensToAnswer(tokenList) {
    this.response.token_list = tokenList
  }

  expectsTimeAnswer() {
    const data = this._getSimpleData()
    return (
      data.active_until_timestamp_requested ||
      data.active_seconds_left_requested ||
      false
    )
  }

  addTimeToAnswer(targetDatetime) {
    const data = this._getSimpleData()
    if (data.active_until_timestamp_requested) {
      const targetTimestamp =
        targetDatetime && targetDatetime.getFullYear() > 1970
          ? Math.floor(targetDatetime.getTime() / 1000)
          : 0
      this.response.active_until_timestamp = targetTimestamp
    } else if (data.active_seconds_left_requested) {
      const secondsLeft = targetDatetime
        ? Math.max(0, (Date.now() - targetDatetime.getTime()) / 1000)
        : 0
      this.response.active_seconds_left = secondsLeft
    } else {
      throw new Error("No time requested")
    }
  }

  addNewBaseUrlToAnswer(newBaseUrl) {
    this.addSettingsToAnswer({ base_url: newBaseUrl })
  }

  addSettingsToAnswer(settingsDict) {
    if (!this.response.settings) {
      this.response.settings = {}
    }
    Object.assign(this.response.settings, settingsDict)
  }

  addExtraDataToAnswer(extraDataDict) {
    if (!this.response.extra_data) {
      this.response.extra_data = {}
    }
    Object.assign(this.response.extra_data, extraDataDict)
  }

  getAnswerPayload() {
    const payload = this.getAnswerDict()
    return OpenPAYGOMetricsShared.convertToMetricsJson(payload)
  }

  getAnswerDict() {
    const condensedAnswer = copy(this.response)
    if (this.secretKey) {
      condensedAnswer.auth =
        OpenPAYGOMetricsShared.generateResponseSignatureFromData({
          serialNumber: this.request.serial_number,
          requestCount: this.request.request_count,
          data: condensedAnswer,
          timestamp: this.request.timestamp,
          secretKey: this.secretKey,
        })
    }
    return OpenPAYGOMetricsShared.convertObjectKeysToCondensed(condensedAnswer)
  }

  _getSimpleData() {
    let data = copy(this.request.data)
    if (!data) return {}
    if (!Array.isArray(data)) return data

    const dataOrder = this.dataFormat.data_order
    if (!dataOrder) throw new Error("Data Format does not contain data_order")

    const cleanData = {}
    for (let i = 0; i < dataOrder.length; i++) {
      cleanData[dataOrder[i]] = data[i] || null
    }

    return OpenPAYGOMetricsShared.convertObjectKeysToSimple(cleanData)
  }

  _getSimpleHistoricalData() {
    const historicalData = copy(this.request.historical_data)
    if (!historicalData) return []

    const historicalDataOrder = this.dataFormat.historical_data_order
    const cleanHistoricalData = []

    historicalData.forEach((timeStep) => {
      const timeStepData = {}
      if (Array.isArray(timeStep)) {
        if (!historicalDataOrder) {
          throw new Error("Data Format does not contain historical_data_order")
        }
        for (let i = 0; i < historicalDataOrder.length; i++) {
          if (i < timeStep.length) {
            timeStepData[historicalDataOrder[i]] = timeStep[i]
          }
        }
        if (timeStep.length > historicalDataOrder.length) {
          throw new Error(
            `Additional variables not present in the historical data format: ${timeStep.slice(
              historicalDataOrder.length
            )}`
          )
        }
      } else if (typeof timeStep === "object") {
        for (const [key, value] of Object.entries(timeStep)) {
          if (!isNaN(key) && Number(key) < historicalDataOrder.length) {
            timeStepData[historicalDataOrder[Number(key)]] = value
          } else {
            timeStepData[key] = value
          }
        }
      } else {
        throw new Error(
          `Invalid historical data step type: ${JSON.stringify(timeStep)}`
        )
      }
      cleanHistoricalData.push(timeStepData)
    })

    return cleanHistoricalData
  }

  _fillTimestampInHistoricalData(historicalData) {
    let lastTimestamp = new Date(this.getDataTimestamp() * 1000)

    historicalData.forEach((timeStep, idx) => {
      if (timeStep.relative_time !== undefined) {
        lastTimestamp = new Date(
          lastTimestamp.getTime() + timeStep.relative_time * 1000
        )
        timeStep.timestamp = Math.floor(lastTimestamp.getTime() / 1000)
        delete timeStep.relative_time
      } else if (timeStep.timestamp) {
        lastTimestamp = new Date(timeStep.timestamp * 1000)
      } else {
        if (idx !== 0) {
          const interval = this.dataFormat.historical_data_interval || 0
          lastTimestamp = new Date(lastTimestamp.getTime() + interval * 1000)
        }
        timeStep.timestamp = Math.floor(lastTimestamp.getTime() / 1000)
      }
    })

    return historicalData
  }
}

module.exports = { MetricsResponseHandler }
