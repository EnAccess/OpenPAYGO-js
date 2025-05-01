const { OpenPAYGOMetricsShared } = require("./metrics")

class MetricsRequestHandler {
  constructor(
    serialNumber,
    dataFormat = null,
    secretKey = null,
    authMethod = null
  ) {
    this.secretKey = secretKey
    this.authMethod = authMethod
    this.request = { serial_number: serialNumber }
    this.dataFormat = dataFormat

    if (this.dataFormat) {
      if (this.dataFormat.id) {
        this.request.data_format_id = this.dataFormat.id
      } else {
        this.request.data_format = this.dataFormat
      }
    }

    this.data = {}
    this.historicalData = {}
  }

  setRequestCount(requestCount) {
    this.request.request_count = requestCount
  }

  setTimestamp(timestamp) {
    this.request.timestamp = timestamp
  }

  setData(data) {
    this.data = data
  }

  setHistoricalData(historicalData) {
    if (!this.dataFormat?.historical_data_interval) {
      for (const timeStep of historicalData) {
        if (!timeStep.timestamp) {
          throw new Error(
            "Historical Data objects must have a timestamp if no historical_data_interval is defined."
          )
        }
      }
    }
    this.historicalData = historicalData
  }

  getSimpleRequestPayload() {
    const payload = this.getSimpleRequestObject()
    return OpenPAYGOMetricsShared.convertToMetricsJson(payload)
  }

  getSimpleRequestObject() {
    const simpleRequest = { ...this.request }
    simpleRequest.data = this.data
    simpleRequest.historical_data = this.historicalData

    if (this.authMethod) {
      simpleRequest.auth =
        OpenPAYGOMetricsShared.generateRequestSignatureFromData(
          simpleRequest,
          this.authMethod,
          this.secretKey
        )
    }

    return simpleRequest
  }

  getCondensedRequestPayload() {
    const payload = this.getCondensedrequest()
    return OpenPAYGOMetricsShared.convertToMetricsJson(payload)
  }

  getCondensedRequestObject() {
    if (!this.dataFormat) {
      throw new Error("No Data Format provided for condensed request")
    }

    const dataOrder = this.dataFormat.data_order
    if (this.data && !dataOrder) {
      throw new Error("Data Format does not contain data_order")
    }

    const historicalDataOrder = this.dataFormat.historical_data_order
    if (this.historicalData && !historicalDataOrder) {
      throw new Error("Data Format does not contain historical_data_order")
    }

    const condensedRequest = JSON.parse(JSON.stringify(this.request))
    condensedRequest.data = []
    condensedRequest.historical_data = []

    const dataCopy = { ...this.data }
    for (const varName of dataOrder) {
      condensedRequest.data.push(varName in dataCopy ? dataCopy[varName] : null)
      delete dataCopy[varName]
    }

    if (Object.keys(dataCopy).length > 0) {
      throw new Error(
        "Additional variables not present in the data format: " +
          JSON.stringify(dataCopy)
      )
    }

    condensedRequest.data = OpenPAYGOMetricsShared.removeTrailingEmptyElements(
      condensedRequest.data
    )

    const historicalDataCopy = JSON.parse(JSON.stringify(this.historicalData))
    for (const timeStep of historicalDataCopy) {
      const timeStepData = []
      for (const varName of historicalDataOrder) {
        timeStepData.push(varName in timeStep ? timeStep[varName] : null)
        delete timeStep[varName]
      }

      if (Object.keys(timeStep).length > 0) {
        throw new Error(
          "Additional variables not present in the historical data format: " +
            JSON.stringify(timeStep)
        )
      }

      condensedRequest.historical_data.push(
        OpenPAYGOMetricsShared.removeTrailingEmptyElements(timeStepData)
      )
    }

    if (this.authMethod) {
      condensedRequest.auth =
        OpenPAYGOMetricsShared.generateRequestSignatureFromData(
          condensedRequest,
          this.authMethod,
          this.secretKey
        )
    }

    return OpenPAYGOMetricsShared.convertDictKeysToCondensed(condensedRequest)
  }
}

module.exports = { MetricsRequestHandler }
