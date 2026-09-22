import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/account/old')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/account"!</div>
}
