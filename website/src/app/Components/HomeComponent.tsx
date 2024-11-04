"use client"
import React, { useState } from "react"
import { Encoder } from "openpaygo"

interface TokenData {
  finalToken: string
  newCount: number
}

interface CommandOption {
  name: string
  requiresArgument: boolean
}

type CommandOptions = {
  [key: string]: CommandOption
}

const HomeComponent: React.FC = () => {
  const [serialNumber, setSerialNumber] = useState<string>("")
  const [counter, setCounter] = useState<number | null>(null)
  const [startingCode, setStartingCode] = useState<number | null>(null)
  const [privateKey, setPrivateKey] = useState<string>("")
  const [selectedCommand, setSelectedCommand] = useState<string>("1")
  const [commandArgument, setCommandArgument] = useState<number>(7)
  const [result, setResult] = useState<TokenData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const commandOptions: CommandOptions = {
    "1": { name: "add_time - Add PAYG time", requiresArgument: true },
    "2": { name: "set_time - Set PAYG time", requiresArgument: true },
    "3": { name: "disable_payg - Disable PAYG", requiresArgument: false },
    "4": { name: "counter_sync - Counter sync", requiresArgument: true },
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    setError(null)

    if (!serialNumber) {
      setError("Serial number is required")
      return
    }
    if (counter === null || isNaN(counter)) {
      setError("Counter must be a valid number")
      return
    }
    if (startingCode === null || isNaN(startingCode)) {
      setError("Starting code must be a valid number")
      return
    }
    if (!privateKey || privateKey.length !== 32) {
      setError("Private key must be a 32-character hexadecimal string")
      return
    }

    if (commandOptions[selectedCommand].requiresArgument && !commandArgument) {
      setError("Command argument is required for this command")
      return
    }

    const encoder = new Encoder()
    try {
      const { finalToken, newCount } = encoder.generateToken({
        tokenType: 1,
        secretKeyHex: privateKey,
        count: counter,
        startingCode: startingCode,
        restrictDigitSet: false,
        value: 1,
        extendToken: false,
      })

      setResult({ finalToken, newCount })
    } catch (err) {
      console.error("Error generating token:", err)
      setError("An error occurred while generating the token.")
    }
  }

  return (
    <div className="background flex justify-between items-center font-neuzeit ">
      <img
        src="svg.svg"
        alt="Left Illustration"
        className="w-1/3 hidden md:block"
      />
      <div className="max-w-2xl mx-auto p-6">
        <header className="bg-[#164669] p-4 text-white text-center">
          <h1 className=" text-3xl font-bold">OpenPAYGO Token Generator</h1>
        </header>
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
          {/* <h1 className="text-2xl text-blue-600 text-center mb-4">
            OpenPAYGO Token Generator
          </h1> */}
          <form onSubmit={handleSubmit} id="tokenForm">
            <div className="mb-4">
              <label
                htmlFor="serialNumber"
                className="block text-sm font-bold text-gray-700"
              >
                Serial number:
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="ex: HQ1932ER3DF"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="counter"
                className="block text-sm font-bold text-gray-700"
              >
                Counter:
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                id="counter"
                value={counter ?? ""}
                onChange={(e) =>
                  setCounter(e.target.value ? parseInt(e.target.value) : null)
                }
                placeholder="ex: 37"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="startingCode"
                className="block text-sm font-bold text-gray-700"
              >
                Starting code:
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                id="startingCode"
                value={startingCode ?? ""}
                onChange={(e) =>
                  setStartingCode(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="ex: 38"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="privateKey"
                className="block text-sm font-bold text-gray-700"
              >
                Private key (hex format):
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                id="privateKey"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="ex: a29ab82edc5fbbc41ec9530f6dac86b1"
                required
                pattern="[0-9a-fA-F]{32}"
                title="Private key must be a 32-character hexadecimal string"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="command"
                className="block text-sm font-bold text-gray-700"
              >
                Command:
              </label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                id="command"
                value={selectedCommand}
                onChange={(e) => {
                  const newCommand = e.target.value
                  setSelectedCommand(newCommand)
                  if (!commandOptions[newCommand].requiresArgument) {
                    setCommandArgument(0)
                  }
                }}
                required
              >
                {Object.entries(commandOptions).map(([value, { name }]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            {commandOptions[selectedCommand].requiresArgument && (
              <div className="mb-4">
                <label
                  htmlFor="commandArgument"
                  className="block text-sm font-bold text-gray-700"
                >
                  Command argument:
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                  id="commandArgument"
                  value={commandArgument}
                  onChange={(e) => setCommandArgument(parseInt(e.target.value))}
                  placeholder="ex: 7"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-[#1b75b9] text-white font-bold py-2 rounded-md hover:opacity-80  hover:transition hover:duration-300"
            >
              Generate
            </button>
          </form>

          <div id="result" className="mt-4">
            {error && <p className="text-red-500">{error}</p>}
            {result && (
              <div className="mt-4">
                <h2 className="font-bold">Result:</h2>
                <table className="min-w-full border border-gray-300 mt-2">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">
                        Serial
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Command
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Token
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Counter
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        {serialNumber}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {commandOptions[selectedCommand].name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {result.finalToken || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {result.newCount || "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <img
        src="https://enaccess.org/wp-content/uploads/2022/10/Asset-251.svg" // Replace with your right illustration path
        alt="Right Illustration"
        className="w-1/3 hidden md:block" // Adjust size and hide on small screens
      />
    </div>
  )
}

export default HomeComponent
