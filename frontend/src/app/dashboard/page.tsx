"use client";

import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";
import PaidIcon from "@mui/icons-material/Paid";
import PublicIcon from "@mui/icons-material/Public";
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { PageShell } from "@/components/PageShell";
import { getDashboardMetrics } from "@/lib/api";
import {
  type DashboardMetrics,
  calculateDashboardMetrics,
  dashboardDummyCompanies,
  formatCompactCurrency,
  formatCompactNumber
} from "@/lib/dashboard-data";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const levelColors = ["#2F52A6", "#258252", "#BF5B26", "#6D5BD0", "#0F766E", "#9A3412"];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(() =>
    calculateDashboardMetrics(dashboardDummyCompanies)
  );
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);

      try {
        const data = await getDashboardMetrics();

        if (!cancelled) {
          setMetrics(data);
          setUsingFallback(false);
        }
      } catch {
        if (!cancelled) {
          setMetrics(calculateDashboardMetrics(dashboardDummyCompanies));
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Companies",
        value: formatCompactNumber(metrics.cards.companyCount),
        helper: `${metrics.cards.companyCount.toLocaleString("en-US")} total records`,
        icon: <BusinessIcon fontSize="small" />,
        accent: "rgb(47, 82, 166)"
      },
      {
        label: "Total revenue",
        value: formatCompactCurrency(metrics.cards.totalRevenue),
        helper: "Annual revenue across suppliers",
        icon: <PaidIcon fontSize="small" />,
        accent: "rgb(37, 130, 82)"
      },
      {
        label: "Countries",
        value: formatCompactNumber(metrics.cards.countryCount),
        helper: "Unique country coverage",
        icon: <PublicIcon fontSize="small" />,
        accent: "rgb(191, 91, 38)"
      },
      {
        label: "Employees",
        value: formatCompactNumber(metrics.cards.employeeCount),
        helper: `${metrics.cards.employeeCount.toLocaleString("en-US")} people`,
        icon: <GroupsIcon fontSize="small" />,
        accent: "rgb(109, 91, 208)"
      }
    ],
    [metrics]
  );

  const doughnutData = useMemo(
    () => ({
      labels: metrics.levelDistribution.map((item) => `Level ${item.level}`),
      datasets: [
        {
          data: metrics.levelDistribution.map((item) => item.count),
          backgroundColor: metrics.levelDistribution.map(
            (_item, index) => levelColors[index % levelColors.length]
          ),
          borderColor: "rgb(255, 255, 255)",
          borderWidth: 3,
          hoverOffset: 8
        }
      ]
    }),
    [metrics.levelDistribution]
  );

  const lineData = useMemo(
    () => ({
      labels: metrics.yearlyGrowth.map((item) => String(item.year)),
      datasets: [
        {
          label: "Cumulative companies",
          data: metrics.yearlyGrowth.map((item) => item.cumulative),
          borderColor: "rgb(47, 82, 166)",
          backgroundColor: "rgba(47, 82, 166, 0.14)",
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.32
        }
      ]
    }),
    [metrics.yearlyGrowth]
  );

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "64%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = metrics.levelDistribution[context.dataIndex];
            return item
              ? `Level ${item.level}: ${item.count} (${item.percentage}%)`
              : `${context.formattedValue}`;
          }
        }
      }
    }
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => `Year ${items[0]?.label ?? ""}`,
          label: (context) => {
            const item = metrics.yearlyGrowth[context.dataIndex];
            return item
              ? [`Cumulative: ${item.cumulative}`, `Added this year: ${item.added}`]
              : `Cumulative: ${context.formattedValue}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 10 }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCompactNumber(Number(value))
        }
      }
    }
  };

  return (
    <PageShell
      title="Dashboard"
      description="Company coverage, revenue, supplier levels, and supply-chain network growth."
    >
      <Stack spacing={2.5}>
        {loading ? <LinearProgress /> : null}
        {usingFallback ? (
          <Alert severity="warning">
            Dashboard API is unavailable, showing calculated dummy company sample data.
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2
          }}
        >
          {cards.map((card) => (
            <Box
              key={card.label}
              sx={{
                border: "1px solid var(--border)",
                borderRadius: 1,
                p: 2,
                bgcolor: "rgb(255, 255, 255)"
              }}
            >
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                <Box
                  sx={{
                    display: "grid",
                    width: 38,
                    height: 38,
                    placeItems: "center",
                    borderRadius: 1,
                    bgcolor: `${card.accent}1A`,
                    color: card.accent
                  }}
                >
                  {card.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography color="text.secondary" sx={{ fontSize: 13, fontWeight: 650 }}>
                    {card.label}
                  </Typography>
                  <Typography sx={{ mt: 0.25, fontSize: 28, fontWeight: 780, lineHeight: 1.15 }}>
                    {card.value}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: 12 }}>
                    {card.helper}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(360px, 0.9fr) minmax(0, 1.3fr)" },
            gap: 2
          }}
        >
          <ChartPanel
            title="Supplier level mix"
            subtitle={`${metrics.sampleSize.toLocaleString("en-US")} companies grouped by supplier level`}
          >
            <Box sx={{ height: 300, position: "relative" }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </Box>
            <TableContainer sx={{ mt: 2, border: "1px solid var(--border)", borderRadius: 1 }}>
              <Table size="small" aria-label="Supplier level distribution">
                <TableHead>
                  <TableRow sx={{ bgcolor: "background.paper" }}>
                    <TableCell>Level</TableCell>
                    <TableCell align="right">Companies</TableCell>
                    <TableCell align="right">Share</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.levelDistribution.map((item, index) => (
                    <TableRow key={item.level}>
                      <TableCell>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: levelColors[index % levelColors.length]
                            }}
                          />
                          <Typography sx={{ fontWeight: 700 }}>Level {item.level}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{item.count.toLocaleString("en-US")}</TableCell>
                      <TableCell align="right">
                        <Chip label={`${item.percentage}%`} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ChartPanel>

          <ChartPanel
            title="Supply-chain network growth"
            subtitle="Cumulative company count by founded year"
          >
            <Box sx={{ height: 414 }}>
              <Line data={lineData} options={lineOptions} />
            </Box>
          </ChartPanel>
        </Box>
      </Stack>
    </PageShell>
  );
}

function ChartPanel({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        border: "1px solid var(--border)",
        borderRadius: 1,
        p: { xs: 2, sm: 2.5 },
        bgcolor: "rgb(255, 255, 255)"
      }}
    >
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h2" sx={{ fontSize: 20 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
          {subtitle}
        </Typography>
      </Stack>
      {children}
    </Box>
  );
}
