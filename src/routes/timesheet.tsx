import Layout from '@/components/Layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/timesheet')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Layout>
        <h1>Timesheet</h1>
      </Layout>
    </>
  )
}
