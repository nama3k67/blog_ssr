import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  redirect: z.string().optional().default('/new'),
})

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = useSearch({ from: Route.fullPath })
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <SignIn fallbackRedirectUrl={redirect} />
    </div>
  )
}
