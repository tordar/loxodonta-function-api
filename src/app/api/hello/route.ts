import { NextResponse } from 'next/server';

export const runtime = 'edge'; 

export async function GET() {
    const currentTime = new Date().toLocaleTimeString();
    const greeting = `Hello! The current time is ${currentTime}`;

    return NextResponse.json({ message: greeting });
}