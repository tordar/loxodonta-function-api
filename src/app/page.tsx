'use client'

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { ExternalLink } from 'lucide-react'

interface ApiEndpoint {
  name: string;
  description: string;
  path: string;
  method: string;
  parameters?: { name: string; type: string; description: string }[];
  responses: { status: number; description: string; example?: string }[];
}

const endpoints: ApiEndpoint[] = [
  {
    name: "Current Time",
    description: "Returns the current time",
    path: "/api/hello",
    method: "GET",
    responses: [
      {
        status: 200,
        description: "Successful response",
        example: '{ "time": "2023-05-20T12:34:56.789Z" }'
      }
    ]
  },
  {
    name: "Execution Logs",
    description: "Returns the execution logs of a Vercel Function",
    path: "/api/demo",
    method: "GET",
    responses: [
      {
        status: 200,
        description: "Successful response",
        example: '{ "logs": ["Log entry 1", "Log entry 2", "Log entry 3"] }'
      }
    ]
  },
  {
    name: "Random Song",
    description: "Returns a song recommendation based on a large Spotify playlist",
    path: "/api/random-song",
    method: "GET",
    responses: [
      {
        status: 200,
        description: "Successful response",
        example: '{ "title": "Song Title", "artist": "Artist Name", "album": "Album Name" }'
      }
    ]
  },
  {
    name: "Album List",
    description: "Returns all albums from authenticated Spotify user. Note: fetches 50 albums at a time, and users with " +
        "a large amount of saved albums may experience a slow response.",
    path: "/api/album-list",
    method: "GET",
    responses: [
      {
        status: 200,
        description: "Successful response",
        example: '{ "totalAlbums": 100, "albums": [{ "id": "1", "name": "Album Name", "artist": "Artist Name" }] }'
      },
      {
        status: 401,
        description: "Unauthorized - User not authenticated with Spotify"
      }
    ]
  },
  {
    name: "Ezbookkeeping / bank callback relay",
    description: "Public callback for bank OAuth. Receives redirect from the bank (code, state in query) and redirects the browser to your local dev backend. Use as stable redirect URI in bank/Ezbookkeeping config.",
    path: "/api/ezbookkeeping-callback",
    method: "GET",
    responses: [
      {
        status: 302,
        description: "Redirect to EZBOOKKEEPING_CALLBACK_TARGET (default: http://localhost:8080/api/bank_integration/callback) with same query string"
      }
    ]
  }
]

export default function Home() {

  return (
      <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Loxodonta API</CardTitle>
              <CardDescription className="text-xl">
                A simple API built with Next.js and deployed on Vercel Functions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                This is a personal API project set up with Vercel Functions and serverless architecture.
                The plan is to build it out and increase functionality over time.
              </p>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            {endpoints.map((endpoint) => (
                <AccordionItem value={endpoint.path} key={endpoint.path}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                    <span className={`mr-2 px-2 py-1 text-xs font-bold rounded ${
                        endpoint.method === 'GET' ? 'bg-green-500 text-white' :
                            endpoint.method === 'POST' ? 'bg-blue-500 text-white' :
                                'bg-gray-500 text-white'
                    }`}>
                      {endpoint.method}
                    </span>
                        <span className="font-semibold">{endpoint.path}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 space-y-4">
                      <h3 className="font-semibold text-lg">{endpoint.name}</h3>
                      <p className="text-gray-600">{endpoint.description}</p>

                      {endpoint.parameters && (
                          <div>
                            <h4 className="font-semibold mt-2">Parameters:</h4>
                            <ul className="list-disc list-inside">
                              {endpoint.parameters.map((param) => (
                                  <li key={param.name}>
                                    <span className="font-semibold">{param.name}</span> ({param.type}): {param.description}
                                  </li>
                              ))}
                            </ul>
                          </div>
                      )}

                      <h4 className="font-semibold mt-2">Responses:</h4>
                      <ul className="list-disc list-inside">
                        {endpoint.responses.map((response) => (
                            <li key={response.status}>
                              <span className="font-semibold">{response.status}</span>: {response.description}
                              {response.example && (
                                  <pre className="bg-gray-100 p-2 mt-2 rounded text-sm overflow-x-auto">
                            {response.example}
                          </pre>
                              )}
                            </li>
                        ))}
                      </ul>

                      <Button
                          variant="outline"
                          onClick={() => window.open(endpoint.path, '_blank')}
                          className="mt-4"
                      >
                        Try it <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                You can make GET requests to the endpoints listed above. For example:
              </p>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {`fetch('https://loxodonta-function-api.vercel.app/api/hello')
  .then(response => response.json())
  .then(data => console.log(data))`}
            </pre>
            </CardContent>
          </Card>
        </div>
      </main>
  )
}