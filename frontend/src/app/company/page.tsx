"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { PageShell } from "@/components/PageShell";
import {
  type Company,
  type CompanyInput,
  createCompany,
  deleteCompany,
  listCompanies,
  updateCompany
} from "@/lib/api";
import { Fragment, useEffect, useMemo, useState } from "react";

const emptyCompanyForm: CompanyInput = {
  companyCode: "",
  companyName: "",
  level: 1,
  country: "",
  city: "",
  foundedYear: new Date().getFullYear(),
  annualRevenue: 0,
  employees: 1,
  parentCompanyCode: null
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("en-US");

function efficiencyColor(value: number, thresholds: { low: number; high: number }) {
  if (value >= thresholds.high) {
    return { bgcolor: "rgba(37, 130, 82, 0.14)", color: "success.dark" };
  }

  if (value >= thresholds.low) {
    return { bgcolor: "rgba(47, 82, 166, 0.12)", color: "primary.dark" };
  }

  return { bgcolor: "rgba(191, 91, 38, 0.14)", color: "secondary.dark" };
}

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [expandedCodes, setExpandedCodes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyInput>(emptyCompanyForm);

  async function loadCompanies() {
    setLoading(true);
    setError(null);

    try {
      setCompanies(await listCompanies());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load companies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCompanies();
  }, []);

  const levels = useMemo(
    () => Array.from(new Set(companies.map((company) => company.level))).sort((a, b) => a - b),
    [companies]
  );

  const efficiencyThresholds = useMemo(() => {
    const sorted = companies.map((company) => company.revenueEfficiency).sort((a, b) => a - b);

    return {
      low: sorted[Math.floor(sorted.length * 0.35)] ?? 0,
      high: sorted[Math.floor(sorted.length * 0.75)] ?? 0
    };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch = company.companyName.toLowerCase().includes(normalizedSearch);
      const matchesLevel = levelFilter.length === 0 || levelFilter.includes(company.level);
      return matchesSearch && matchesLevel;
    });
  }, [companies, levelFilter, search]);

  useEffect(() => {
    setPage(0);
  }, [levelFilter, search]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredCompanies.length / rowsPerPage) - 1);

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredCompanies.length, page, rowsPerPage]);

  const visibleCompanies = useMemo(
    () => filteredCompanies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredCompanies, page, rowsPerPage]
  );

  function toggleExpanded(companyCode: string) {
    setExpandedCodes((current) =>
      current.includes(companyCode)
        ? current.filter((code) => code !== companyCode)
        : [...current, companyCode]
    );
  }

  function openCreateDialog() {
    setEditingCompany(null);
    setForm(emptyCompanyForm);
    setFormOpen(true);
  }

  function openEditDialog(company: Company) {
    setEditingCompany(company);
    setForm({
      companyCode: company.companyCode,
      companyName: company.companyName,
      level: company.level,
      country: company.country,
      city: company.city,
      foundedYear: company.foundedYear,
      annualRevenue: company.annualRevenue,
      employees: company.employees,
      parentCompanyCode: company.parentCompanyCode
    });
    setFormOpen(true);
  }

  function closeDialog() {
    setEditingCompany(null);
    setForm(emptyCompanyForm);
    setFormOpen(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      if (editingCompany) {
        const { companyCode: _companyCode, ...input } = form;
        const updated = await updateCompany(editingCompany.companyCode, input);
        setCompanies((current) =>
          current.map((company) => (company.companyCode === updated.companyCode ? updated : company))
        );
      } else {
        const created = await createCompany(form);
        setCompanies((current) => [...current, created].sort((a, b) => a.companyName.localeCompare(b.companyName)));
      }

      closeDialog();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save company.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(companyCode: string) {
    setError(null);

    try {
      await deleteCompany(companyCode);
      setCompanies((current) => current.filter((company) => company.companyCode !== companyCode));
      setExpandedCodes((current) => current.filter((code) => code !== companyCode));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete company.");
    }
  }

  const canSave = Boolean(
    form.companyCode.trim() &&
      form.companyName.trim() &&
      form.country.trim() &&
      form.city.trim() &&
      form.level > 0 &&
      form.foundedYear > 0 &&
      form.annualRevenue >= 0 &&
      form.employees > 0
  );

  return (
    <PageShell
      title="Company"
      description="Review company hierarchy, operating location, and revenue efficiency."
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          sx={{ alignItems: { xs: "stretch", lg: "center" } }}
        >
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company name"
            aria-label="Search companies by name"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
            sx={{ maxWidth: { lg: 340 } }}
          />

          <FormControl sx={{ minWidth: { xs: "100%", lg: 220 } }}>
            <InputLabel id="level-filter-label">Level</InputLabel>
            <Select
              labelId="level-filter-label"
              multiple
              value={levelFilter}
              onChange={(event) => {
                const value = event.target.value;
                setLevelFilter(typeof value === "string" ? value.split(",").map(Number) : value);
              }}
              input={<OutlinedInput label="Level" />}
              renderValue={(selected) => selected.map((level) => `Level ${level}`).join(", ")}
            >
              {levels.map((level) => (
                <MenuItem key={level} value={level}>
                  <ListItemText primary={`Level ${level}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <Tooltip title="Refresh companies">
              <IconButton aria-label="Refresh companies" onClick={loadCompanies}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Add company
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {loading ? <LinearProgress /> : null}

        <TableContainer sx={{ border: "1px solid var(--border)", borderRadius: 1, maxWidth: "100%" }}>
          <Table aria-label="Companies collapsible table">
            <TableHead>
              <TableRow sx={{ bgcolor: "background.paper" }}>
                <TableCell sx={{ width: 48 }} />
                <TableCell>Name</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Revenue efficiency</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleCompanies.map((company) => {
                const expanded = expandedCodes.includes(company.companyCode);
                const efficiencySx = efficiencyColor(company.revenueEfficiency, efficiencyThresholds);

                return (
                  <Fragment key={company.companyCode}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          aria-label={expanded ? "Collapse company details" : "Expand company details"}
                          size="small"
                          onClick={() => toggleExpanded(company.companyCode)}
                        >
                          {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>{company.companyName}</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                          {company.companyCode}
                          {company.parentCompanyCode ? ` · Parent ${company.parentCompanyCode}` : ""}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`Level ${company.level}`} size="small" />
                      </TableCell>
                      <TableCell>{company.country}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            minWidth: 112,
                            justifyContent: "center",
                            borderRadius: 1,
                            px: 1.25,
                            py: 0.625,
                            fontWeight: 750,
                            ...efficiencySx
                          }}
                        >
                          {currencyFormatter.format(company.revenueEfficiency)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit company">
                          <IconButton
                            aria-label={`Edit ${company.companyName}`}
                            onClick={() => openEditDialog(company)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete company">
                          <IconButton
                            aria-label={`Delete ${company.companyName}`}
                            color="error"
                            onClick={() => handleDelete(company.companyCode)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ borderBottom: expanded ? undefined : 0, py: 0 }}>
                        <Collapse in={expanded} timeout={160} unmountOnExit>
                          <Box
                            sx={{
                              display: "grid",
                              contain: "layout paint",
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                lg: "repeat(4, minmax(0, 1fr))"
                              },
                              gap: 2,
                              px: { xs: 1, sm: 2 },
                              py: 2.25,
                              bgcolor: "rgb(250, 251, 253)"
                            }}
                          >
                            <Detail label="City" value={company.city} />
                            <Detail label="Started supply" value={String(company.foundedYear)} />
                            <Detail label="Annual revenue" value={currencyFormatter.format(company.annualRevenue)} />
                            <Detail label="Employees" value={numberFormatter.format(company.employees)} />
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}

              {!loading && filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 5, textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 700 }}>No companies found</Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        Adjust the filters or add a new company.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredCompanies.length}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Stack>

      <Dialog open={formOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingCompany ? "Edit company" : "Add company"}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
              pt: 1
            }}
          >
            <TextField
              label="Company code"
              value={form.companyCode}
              disabled={Boolean(editingCompany)}
              onChange={(event) =>
                setForm((current) => ({ ...current, companyCode: event.target.value }))
              }
            />
            <TextField
              label="Company name"
              value={form.companyName}
              onChange={(event) =>
                setForm((current) => ({ ...current, companyName: event.target.value }))
              }
            />
            <TextField
              label="Level"
              type="number"
              value={form.level}
              onChange={(event) =>
                setForm((current) => ({ ...current, level: Number(event.target.value) }))
              }
            />
            <TextField
              label="Country"
              value={form.country}
              onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
            />
            <TextField
              label="City"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            />
            <TextField
              label="Started supply"
              type="number"
              value={form.foundedYear}
              onChange={(event) =>
                setForm((current) => ({ ...current, foundedYear: Number(event.target.value) }))
              }
            />
            <TextField
              label="Annual revenue"
              type="number"
              value={form.annualRevenue}
              onChange={(event) =>
                setForm((current) => ({ ...current, annualRevenue: Number(event.target.value) }))
              }
            />
            <TextField
              label="Employees"
              type="number"
              value={form.employees}
              onChange={(event) =>
                setForm((current) => ({ ...current, employees: Number(event.target.value) }))
              }
            />
            <TextField
              label="Parent company code"
              value={form.parentCompanyCode ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, parentCompanyCode: event.target.value || null }))
              }
              sx={{ gridColumn: { sm: "1 / -1" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" disabled={!canSave || saving} onClick={handleSave}>
            {editingCompany ? "Save changes" : "Create company"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 650 }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
