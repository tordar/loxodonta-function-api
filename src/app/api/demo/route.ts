import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    const startTime = Date.now();

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // Get the request headers
    const headers = Object.fromEntries(request.headers);

    // Get environment information
    const environment = process.env.VERCEL_ENV || 'development';

    // Construct log messages
    const logs = [
        `[${new Date().toISOString()}] Function execution started`,
        `[${new Date().toISOString()}] Request received from ${headers['user-agent'] || 'Unknown'}`,
        `[${new Date().toISOString()}] Processing request...`,
        `[${new Date().toISOString()}] Function execution completed`,
    ];

    // Construct the response
    const response = {
        message: 'Function executed successfully',
        executionTime: `${executionTime}ms`,
        environment,
        logs,
        request: {
            method: request.method,
            url: request.url,
            headers: headers,
        },
    };

    return NextResponse.json(response);
}