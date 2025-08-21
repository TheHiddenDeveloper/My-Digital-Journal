'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Something went wrong!</CardTitle>
                <CardDescription>An unexpected error occurred. You can try to recover from this error.</CardDescription>
            </CardHeader>
            <CardContent>
                <details className="mb-4">
                    <summary className="text-sm text-muted-foreground cursor-pointer">Error details</summary>
                    <pre className="mt-2 text-xs text-destructive bg-destructive/10 p-4 rounded-md overflow-x-auto">
                        {error.message}
                    </pre>
                </details>
            </CardContent>
            <CardFooter>
                 <Button onClick={() => reset()}>
                    Try again
                </Button>
            </CardFooter>
        </Card>
    </div>
  )
}
