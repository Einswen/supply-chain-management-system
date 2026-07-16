import { PageShell } from "@/components/PageShell";
import { Box, Stack, Typography } from "@mui/material";

export default function DashboardPage() {
  return (
    <PageShell title="Dashboard" description="Overview metrics and operational signals will live here.">
      <Stack spacing={1}>
        <Typography variant="h2">Welcome back</Typography>
        <Typography color="text.secondary">
          The authenticated navigation shell is ready for dashboard content.
        </Typography>
      </Stack>
      <Box sx={{ mt: 3, height: 120, bgcolor: "var(--surface)", borderRadius: 1 }} />
    </PageShell>
  );
}
