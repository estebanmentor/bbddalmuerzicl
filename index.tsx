import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import ReactDOM from 'react-dom/client';
import { fetchRestaurantData } from './services/api';
import { generateSimulatedLogs } from './services/geminiService';
import type { ApiLog } from './types';

const POLLING_INTERVAL_MS = 5000;
const API_ENDPOINT = '/api/restaurants';

const App: React.FC = () => {
    const [logs, setLogs] = useState<ApiLog[]>([]);
    const [isPolling, setIsPolling] = useState(true);
    const [simulationPrompt, setSimulationPrompt] = useState('5 successful requests from desktop users in South America');
    const [isSimulating, setIsSimulating] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const makeRequest = useCallback(async () => {
        const startTime = new Date();
        let logEntry: ApiLog;

        try {
            const response = await fetchRestaurantData();
            logEntry = {
                id: startTime.getTime(),
                timestamp: startTime.toISOString(),
                method: 'GET',
                url: API_ENDPOINT,
                status: response.status,
                statusText: response.statusText,
                type: 'real',
            };
        } catch (error) {
            logEntry = {
                id: startTime.getTime(),
                timestamp: startTime.toISOString(),
                method: 'GET',
                url: API_ENDPOINT,
                status: 0,
                statusText: error instanceof Error ? error.message : 'Request Failed',
                type: 'real',
            };
        }
        
        setLogs(prevLogs => [logEntry, ...prevLogs.slice(0, 199)]);
    }, []);

    useEffect(() => {
        if (logs.length === 0) {
            makeRequest();
        }
        
        if (isPolling) {
            const intervalId = setInterval(makeRequest, POLLING_INTERVAL_MS);
            return () => clearInterval(intervalId);
        }
    }, [isPolling, makeRequest, logs.length]);

    const getStatusColor = (status: number): string => {
        if (status >= 200 && status < 300) return '#22c55e'; // green-500
        if (status >= 400 && status < 500) return '#ef4444'; // red-500
        if (status >= 500) return '#f97316'; // orange-500
        return '#eab308'; // yellow-500
    };

    const handleTogglePolling = () => setIsPolling(prev => !prev);
    const handleClearLogs = () => setLogs([]);

    const handleSimulation = async () => {
        setIsSimulating(true);
        setError(null);
        try {
            const simulatedLogs = await generateSimulatedLogs(simulationPrompt, API_ENDPOINT);
            // Add a unique id and type to each simulated log
            const processedLogs: ApiLog[] = simulatedLogs.map(log => ({
                ...log,
                id: new Date(log.timestamp).getTime() + Math.random(),
                type: 'simulated',
            }));
            setLogs(prevLogs => [...processedLogs, ...prevLogs]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate simulation.");
            console.error(e);
        } finally {
            setIsSimulating(false);
        }
    };


    return (
        <main style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.h1}>API Monitor</h1>
                <div style={styles.statusIndicator}>
                    <div style={isPolling ? styles.statusDot : {...styles.statusDot, animation: 'none', backgroundColor: '#6b7280'}}></div>
                    <span>{isPolling ? 'Live' : 'Paused'}</span>
                </div>
            </header>

            <div style={styles.toolbar}>
                 <button onClick={handleTogglePolling} style={styles.button}>
                    {isPolling ? 'Pause' : 'Resume'}
                </button>
                 <button onClick={handleClearLogs} style={styles.buttonSecondary}>
                    Clear Logs
                </button>
            </div>
            
            <div style={styles.simulatorSection}>
                <h2 style={styles.h2}>AI Traffic Simulator</h2>
                <p style={styles.simulatorDescription}>Generate simulated external traffic logs using the Gemini API.</p>
                <div style={styles.inputGroup}>
                    <input 
                        type="text"
                        value={simulationPrompt}
                        onChange={(e) => setSimulationPrompt(e.target.value)}
                        placeholder="e.g., 10 requests from mobile devices"
                        style={styles.input}
                    />
                    <button onClick={handleSimulation} style={styles.button} disabled={isSimulating}>
                        {isSimulating ? 'Generating...' : 'Generate Traffic'}
                    </button>
                </div>
                {error && <p style={styles.errorText}>{error}</p>}
            </div>


            <div style={styles.logContainer}>
                {logs.length === 0 ? (
                    <p style={styles.emptyState}>No requests logged yet. Monitoring is active.</p>
                ) : (
                    logs.map(log => (
                        <div key={log.id} style={{...styles.logEntry, ...(log.type === 'simulated' && styles.logEntrySimulated)}}>
                            <div>
                                <span style={{...styles.tag, ...(log.type === 'real' ? styles.tagReal : styles.tagSimulated)}}>
                                    {log.type?.toUpperCase()}
                                </span>
                                <span style={styles.logTimestamp}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            </div>
                            <div style={styles.logDetails}>
                                <span style={styles.logMethod}>{log.method}</span>
                                <span style={{...styles.logStatus, color: getStatusColor(log.status)}}>
                                    {log.status > 0 ? `${log.status} ${log.statusText}` : log.statusText}
                                </span>
                            </div>
                            <div style={styles.logUrlContainer}>
                                <span style={styles.logUrl}>{log.url}</span>
                                {log.type === 'simulated' && log.ipAddress && (
                                     <span style={styles.logMeta}>IP: {log.ipAddress} | {log.userAgent}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
             <footer style={styles.footer}>
                <p>Continuously monitoring endpoint: <strong>{API_ENDPOINT}</strong></p>
            </footer>
        </main>
    );
};

const baseButton: CSSProperties = {
    color: '#f9fafb',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s, opacity 0.2s',
    whiteSpace: 'nowrap',
};

const styles: { [key: string]: CSSProperties } = {
    container: {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px',
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #374151',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        marginBottom: '16px',
    },
    h1: { color: '#f9fafb', margin: 0, fontSize: '24px' },
    h2: { color: '#e5e7eb', margin: '0 0 4px 0', fontSize: '18px' },
    statusIndicator: { display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', fontSize: '14px' },
    statusDot: { width: '10px', height: '10px', backgroundColor: '#34d399', borderRadius: '50%', animation: 'pulse 1.5s infinite' },
    toolbar: { display: 'flex', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid #374151', marginBottom: '20px' },
    button: { ...baseButton, backgroundColor: '#4f46e5' },
    buttonSecondary: { ...baseButton, backgroundColor: '#374151', border: '1px solid #4b5563' },
    simulatorSection: { paddingBottom: '20px', borderBottom: '1px solid #374151', marginBottom: '20px' },
    simulatorDescription: { margin: '0 0 12px 0', color: '#9ca3af', fontSize: '14px' },
    inputGroup: { display: 'flex', gap: '10px' },
    input: {
        flexGrow: 1,
        backgroundColor: '#111827',
        border: '1px solid #4b5563',
        color: '#f9fafb',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '14px',
    },
    errorText: { color: '#fca5a5', fontSize: '12px', marginTop: '8px' },
    logContainer: { backgroundColor: '#111827', borderRadius: '6px', padding: '10px', height: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '14px', color: '#d1d5db' },
    emptyState: { textAlign: 'center', padding: '20px', color: '#6b7280' },
    logEntry: { display: 'grid', gridTemplateColumns: '220px 150px 1fr', gap: '15px', padding: '10px 12px', borderBottom: '1px solid #1f2937', alignItems: 'center' },
    logEntrySimulated: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    logDetails: { display: 'flex', flexDirection: 'column', gap: '4px' },
    logUrlContainer: { display: 'flex', flexDirection: 'column', gap: '4px', wordBreak: 'break-all' },
    logTimestamp: { color: '#6b7280', marginLeft: '8px' },
    logMethod: { fontWeight: 'bold', color: '#9ca3af' },
    logUrl: { color: '#9ca3af' },
    logMeta: { fontSize: '12px', color: '#6b7280' },
    logStatus: { fontWeight: 'bold' },
    tag: { padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' },
    tagReal: { backgroundColor: '#10b981', color: '#ffffff' },
    tagSimulated: { backgroundColor: '#3b82f6', color: '#ffffff' },
    footer: { marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #374151', textAlign: 'center', fontSize: '12px', color: '#6b7280' },
};

const rootEl = document.getElementById('root');
if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<React.StrictMode><App /></React.StrictMode>);
}