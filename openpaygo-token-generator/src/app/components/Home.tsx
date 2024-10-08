"use client";
import { useState } from 'react';
import { OpenPAYGOTokenEncoder } from 'openpaygo';

interface TokenData {
    finalToken: string;
    newCount: number;
}

const HomeComponent: React.FC = () => {
    const [serialNumber, setSerialNumber] = useState<string>('');
    const [counter, setCounter] = useState<number | ''>(''); 
    const [startingCode, setStartingCode] = useState<number | ''>(''); 
    const [privateKey, setPrivateKey] = useState<string>('');
    const [commandArgument, setCommandArgument] = useState<number | ''>(''); 
    const [timeGranularity, setTimeGranularity] = useState<number | ''>(''); 
    const [result, setResult] = useState<TokenData | null>(null); 
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError(null);
        setResult(null);

        const encoder = new OpenPAYGOTokenEncoder();
        try {
            const tokenData = await encoder.generateToken({
                secretKeyHex: privateKey,
                count: parseInt(counter as string), 
                value: parseInt(commandArgument as string),
                tokenType: 2, 
                startingCode: parseInt(startingCode as string), 
                valueDivider: parseInt(timeGranularity as string),
                restrictDigitSet: false,
                extendToken: false,
            });
            console.log("Token Data:", tokenData);
            setResult(tokenData);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl text-blue-600 text-center mb-4">PAYG Code Generator</h1>
            <form onSubmit={handleSubmit} id="tokenForm">
                <div className="mb-4">
                    <label htmlFor="serialNumber" className="block text-sm font-bold text-gray-700">Serial number:</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" id="serialNumber" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="ex: HQ1932ER3DF" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="counter" className="block text-sm font-bold text-gray-700">Counter:</label>
                    <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md p-2" id="counter" value={counter} onChange={(e) => setCounter(e.target.value)} placeholder="ex: 37" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="startingCode" className="block text-sm font-bold text-gray-700">Starting code:</label>
                    <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md p-2" id="startingCode" value={startingCode} onChange={(e) => setStartingCode(e.target.value)} placeholder="ex: 38" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="privateKey" className="block text-sm font-bold text-gray-700">Private key (hex format):</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" id="privateKey" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} placeholder="ex: a29ab82edc5fbbc41ec9530f6dac86b1" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="command" className="block text-sm font-bold text-gray-700">Command:</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" id="command" value={commandArgument} onChange={(e) => setCommandArgument(e.target.value)} required>
                        <option value="1">add_time - Add PAYG time</option>
                        <option value="2">set_time - Set PAYG time</option>
                        <option value="3">disable_payg - Disable PAYG</option>
                        <option value="4">counter_sync - Counter sync</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="commandArgument" className="block text-sm font-bold text-gray-700">Command argument:</label>
                    <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md p-2" id="commandArgument" value={commandArgument} onChange={(e) => setCommandArgument(e.target.value)} placeholder="ex: 7" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="timeGranularity" className="block text-sm font-bold text-gray-700">Time granularity:</label>
                    <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md p-2" id="timeGranularity" value={timeGranularity} onChange={(e) => setTimeGranularity(e.target.value)} placeholder="ex: 4" required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700">Generate</button>
            </form>

            <div id="result" className="mt-4">
                {error && <p className="text-red-500">{error}</p>}
                {result && (
                    <div className="mt-4">
                        <h2 className="font-bold">Result:</h2>
                        <table className="min-w-full border border-gray-300 mt-2">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2">Serial</th>
                                    <th className="border border-gray-300 px-4 py-2">Command</th>
                                    <th className="border border-gray-300 px-4 py-2">Token</th>
                                    <th className="border border-gray-300 px-4 py-2">Counter</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2">{serialNumber}</td>
                                    <td className="border border-gray-300 px-4 py-2">{commandArgument}</td>
                                    <td className="border border-gray-300 px-4 py-2">{result?.finalToken}</td>
                                    <td className="border border-gray-300 px-4 py-2">{result?.newCount}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeComponent;