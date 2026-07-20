"use client";

import ClearAllIcon from "@mui/icons-material/ClearAll";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import PublicIcon from "@mui/icons-material/Public";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LayersIcon from "@mui/icons-material/Layers";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from "@mui/material";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { getCompaniesByFilter } from "@/lib/api";
import {
  type CompanyBarChartQuery,
  type CompanyBarChartResult,
  type CompanyChartDimension,
  formatCompactNumber
} from "@/lib/dashboard-data";

type FilterForm = {
  level: number[];
  country: string[];
  city: string[];
  foundedYearStart: string;
  foundedYearEnd: string;
  annualRevenueMin: string;
  annualRevenueMax: string;
  employeesMin: string;
  employeesMax: string;
};

const emptyFilter: FilterForm = {
  level: [],
  country: [],
  city: [],
  foundedYearStart: "",
  foundedYearEnd: "",
  annualRevenueMin: "",
  annualRevenueMax: "",
  employeesMin: "",
  employeesMax: ""
};

const dimensionDetails: Array<{
  value: CompanyChartDimension;
  label: string;
  icon: ReactNode;
  color: string;
}> = [
  { value: "level", label: "Company level", icon: <LayersIcon fontSize="small" />, color: "#2F52A6" },
  { value: "country", label: "Country", icon: <PublicIcon fontSize="small" />, color: "#258252" },
  { value: "city", label: "City", icon: <ApartmentIcon fontSize="small" />, color: "#BF5B26" }
];

export function CompanyDistributionChart() {
  const [dimension, setDimension] = useState<CompanyChartDimension>("level");
  const [filter, setFilter] = useState<FilterForm>(emptyFilter);
  const [result, setResult] = useState<CompanyBarChartResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo<CompanyBarChartQuery>(
    () => ({
      dimension,
      filter: {
        ...(filter.level.length ? { level: filter.level } : {}),
        ...(filter.country.length ? { country: filter.country } : {}),
        ...(filter.city.length ? { city: filter.city } : {}),
        ...(filter.foundedYearStart || filter.foundedYearEnd
          ? {
              founded_year: {
                ...(filter.foundedYearStart ? { start: Number(filter.foundedYearStart) } : {}),
                ...(filter.foundedYearEnd ? { end: Number(filter.foundedYearEnd) } : {})
              }
            }
          : {}),
        ...(filter.annualRevenueMin || filter.annualRevenueMax
          ? {
              annual_revenue: {
                ...(filter.annualRevenueMin ? { min: Number(filter.annualRevenueMin) } : {}),
                ...(filter.annualRevenueMax ? { max: Number(filter.annualRevenueMax) } : {})
              }
            }
          : {}),
        ...(filter.employeesMin || filter.employeesMax
          ? {
              employees: {
                ...(filter.employeesMin ? { min: Number(filter.employeesMin) } : {}),
                ...(filter.employeesMax ? { max: Number(filter.employeesMax) } : {})
              }
            }
          : {})
      }
    }),
    [dimension, filter]
  );

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");

      void getCompaniesByFilter(query)
        .then((data) => {
          if (!cancelled) {
            setResult(data);
          }
        })
        .catch((requestError: unknown) => {
          if (!cancelled) {
            setError(requestError instanceof Error ? requestError.message : "Unable to load company data.");
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const activeDimension = dimensionDetails.find((item) => item.value === dimension) ?? dimensionDetails[0];
  const hasFilters = Object.values(filter).some((value) => (Array.isArray(value) ? value.length > 0 : value));
  const options = result?.filterOptions;

  const chartData = useMemo(
    () => ({
      labels: result?.bars.map((item) => (dimension === "level" ? `Level ${item.label}` : item.label)) ?? [],
      datasets: [
        {
          label: "Companies",
          data: result?.bars.map((item) => item.count) ?? [],
          backgroundColor: result?.bars.map((_item, index) => `${activeDimension.color}${index % 2 === 0 ? "D9" : "A8"}`) ?? [],
          borderColor: activeDimension.color,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 48
        }
      ]
    }),
    [activeDimension.color, dimension, result?.bars]
  );

  const chartOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => items[0]?.label ?? "",
            label: (context) => `Companies: ${Number(context.raw).toLocaleString("en-US")}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            autoSkip: dimension !== "level",
            maxRotation: 0,
            minRotation: 0,
            maxTicksLimit: dimension === "city" ? 12 : 16
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            callback: (value) => formatCompactNumber(Number(value))
          }
        }
      }
    }),
    [dimension]
  );

  return (
    <Box
      component="section"
      aria-labelledby="company-distribution-heading"
      sx={{ border: "1px solid var(--border)", borderRadius: 1, bgcolor: "rgb(255, 255, 255)" }}
    >
      <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: { xs: 2, sm: 2.5 }, pb: 2, borderBottom: "1px solid var(--border)" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography id="company-distribution-heading" variant="h2" sx={{ fontSize: 20 }}>
              Company distribution
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 13 }}>
              Company count grouped by the selected dimension.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
            <Chip
              color="primary"
              variant="outlined"
              label={`${(result?.matchedCompanies ?? 0).toLocaleString("en-US")} matched`}
            />
            <Tooltip title="Clear all filters">
              <span>
                <IconButton
                  aria-label="Clear all filters"
                  color="primary"
                  disabled={!hasFilters}
                  onClick={() => setFilter(emptyFilter)}
                >
                  <ClearAllIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        <ToggleButtonGroup
          aria-label="Chart dimension"
          exclusive
          value={dimension}
          onChange={(_event, value: CompanyChartDimension | null) => value && setDimension(value)}
          size="small"
          sx={{ mt: 2, flexWrap: "wrap" }}
        >
          {dimensionDetails.map((item) => (
            <ToggleButton key={item.value} value={item.value} sx={{ gap: 0.75, px: 1.25 }}>
              {item.icon}
              {item.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" }, minHeight: 480 }}>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, minWidth: 0 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {loading && !result ? (
            <Stack spacing={1.5} sx={{ height: 400, justifyContent: "flex-end" }}>
              <Skeleton variant="rounded" height="60%" />
              <Skeleton variant="text" width="80%" />
            </Stack>
          ) : result?.bars.length ? (
            <Box sx={{ height: 400, position: "relative", opacity: loading ? 0.48 : 1, transition: "opacity 160ms ease-out" }}>
              <Bar data={chartData} options={chartOptions} />
            </Box>
          ) : (
            <Stack sx={{ height: 400, alignItems: "center", justifyContent: "center", textAlign: "center" }} spacing={1}>
              <FilterAltIcon color="disabled" sx={{ fontSize: 34 }} />
              <Typography sx={{ fontWeight: 700 }}>No companies match these filters</Typography>
              <Button variant="outlined" onClick={() => setFilter(emptyFilter)}>
                Clear filters
              </Button>
            </Stack>
          )}
        </Box>

        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderTop: { xs: "1px solid var(--border)", lg: 0 }, borderLeft: { lg: "1px solid var(--border)" }, bgcolor: "background.paper" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 750 }}>Filters</Typography>
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            <MultiSelect
              label="Company levels"
              options={options?.levels ?? []}
              value={filter.level}
              getOptionLabel={(value) => `Level ${value}`}
              onChange={(level) => setFilter((current) => ({ ...current, level }))}
              disabled={!options}
            />
            <MultiSelect
              label="Countries"
              options={options?.countries ?? []}
              value={filter.country}
              onChange={(country) => setFilter((current) => ({ ...current, country }))}
              disabled={!options}
            />
            <MultiSelect
              label="Cities"
              options={options?.cities ?? []}
              value={filter.city}
              onChange={(city) => setFilter((current) => ({ ...current, city }))}
              disabled={!options}
            />

            <RangeFields
              label="Joined network year"
              startLabel="Start year"
              endLabel="End year"
              start={filter.foundedYearStart}
              end={filter.foundedYearEnd}
              min={options?.ranges.foundedYear.min ?? undefined}
              max={options?.ranges.foundedYear.max ?? undefined}
              onStartChange={(foundedYearStart) => setFilter((current) => ({ ...current, foundedYearStart }))}
              onEndChange={(foundedYearEnd) => setFilter((current) => ({ ...current, foundedYearEnd }))}
              disabled={!options}
            />
            <RangeFields
              label="Annual revenue"
              startLabel="Min revenue"
              endLabel="Max revenue"
              start={filter.annualRevenueMin}
              end={filter.annualRevenueMax}
              min={options?.ranges.annualRevenue.min ?? undefined}
              max={options?.ranges.annualRevenue.max ?? undefined}
              prefix="$"
              onStartChange={(annualRevenueMin) => setFilter((current) => ({ ...current, annualRevenueMin }))}
              onEndChange={(annualRevenueMax) => setFilter((current) => ({ ...current, annualRevenueMax }))}
              disabled={!options}
            />
            <RangeFields
              label="Employees"
              startLabel="Min employees"
              endLabel="Max employees"
              start={filter.employeesMin}
              end={filter.employeesMax}
              min={options?.ranges.employees.min ?? undefined}
              max={options?.ranges.employees.max ?? undefined}
              onStartChange={(employeesMin) => setFilter((current) => ({ ...current, employeesMin }))}
              onEndChange={(employeesMax) => setFilter((current) => ({ ...current, employeesMax }))}
              disabled={!options}
            />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function MultiSelect<T extends string | number>({
  label,
  options,
  value,
  getOptionLabel = (option: T) => String(option),
  onChange,
  disabled
}: {
  label: string;
  options: T[];
  value: T[];
  getOptionLabel?: (option: T) => string;
  onChange: (value: T[]) => void;
  disabled: boolean;
}) {
  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      value={value}
      disabled={disabled}
      limitTags={1}
      size="small"
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, selected) => option === selected}
      onChange={(_event, selected) => onChange(selected)}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}

function RangeFields({
  label,
  startLabel,
  endLabel,
  start,
  end,
  min,
  max,
  prefix,
  onStartChange,
  onEndChange,
  disabled
}: {
  label: string;
  startLabel: string;
  endLabel: string;
  start: string;
  end: string;
  min?: number;
  max?: number;
  prefix?: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  disabled: boolean;
}) {
  const sliderMin = min ?? 0;
  const sliderMax = max ?? 1;
  const sliderValue: [number, number] = [
    clampNumber(start ? Number(start) : sliderMin, sliderMin, sliderMax),
    clampNumber(end ? Number(end) : sliderMax, sliderMin, sliderMax)
  ].sort((first, second) => first - second) as [number, number];

  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 0.75, fontSize: 12, fontWeight: 700 }}>
        {label}
      </Typography>
      <Slider
        aria-label={`${label} range`}
        disabled={disabled}
        min={sliderMin}
        max={sliderMax}
        step={1}
        value={sliderValue}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => formatSliderValue(value, prefix)}
        onChange={(_event, value) => {
          if (Array.isArray(value)) {
            onStartChange(String(value[0]));
            onEndChange(String(value[1]));
          }
        }}
        sx={{ mx: 0.75, width: "calc(100% - 12px)", mb: 0.5 }}
      />
      <Stack direction="row" spacing={1}>
        <TextField
          aria-label={startLabel}
          disabled={disabled}
          label={startLabel}
          size="small"
          type="number"
          value={start}
          onChange={(event) => onStartChange(event.target.value)}
          slotProps={{
            htmlInput: { min, max },
            input: prefix ? { startAdornment: <InputAdornment position="start">{prefix}</InputAdornment> } : undefined
          }}
        />
        <TextField
          aria-label={endLabel}
          disabled={disabled}
          label={endLabel}
          size="small"
          type="number"
          value={end}
          onChange={(event) => onEndChange(event.target.value)}
          slotProps={{
            htmlInput: { min, max },
            input: prefix ? { startAdornment: <InputAdornment position="start">{prefix}</InputAdornment> } : undefined
          }}
        />
      </Stack>
    </Box>
  );
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatSliderValue(value: number, prefix?: string) {
  return `${prefix ?? ""}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
}
