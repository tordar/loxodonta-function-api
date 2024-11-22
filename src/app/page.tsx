'use client'

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Loxodonta API</CardTitle>
            <CardDescription>
              This is a simple API built with Next.js and deployed on Vercel Functions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">What is this?</h2>
              <p>
                This is a personal API project set up with Vercel Functions and serverless architecture.
                The plan is to build it out, and increase functionality over time.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">Available Endpoints</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">/api/hello</code> - Returns the current time
                  <Button variant="link" className="ml-2 text-sm" onClick={() => window.open('/api/hello', '_blank')}>
                    Try it
                  </Button>
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">/api/demo</code> - Returns the execution logs of a
                  Vercel Function
                  <Button variant="link" className="ml-2 text-sm" onClick={() => window.open('/api/demo', '_blank')}>
                    Try it
                  </Button>
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">/api/random-song</code> - Returns a song recommendation
                  based on a large Spotify playlist.
                  <Button variant="link" className="ml-2 text-sm"
                          onClick={() => window.open('/api/random-song', '_blank')}>
                    Try it
                  </Button>
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">/api/album-list</code> - Returns all albums from authenticated Spotify user.
                  <Button variant="link" className="ml-2 text-sm"
                          onClick={() => window.open('/api/album-list', '_blank')}>
                    Try it
                  </Button>
                </li>
                {/* Add more endpoints here as you create them */}
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">How to Use</h2>
              <p>
                You can make GET requests to the endpoints listed above. For example:
              </p>
              <pre className="bg-muted p-2 rounded mt-2 overflow-x-auto">
              fetch(&apos;https://loxodonta-function-api.vercel.app/api/hello&apos;)
                .then(response =&gt; response.json())
                .then(data =&gt; console.log(data))
            </pre>
            </section>
          </CardContent>
        </Card>
      </main>
  )
}