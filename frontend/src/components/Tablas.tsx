import React, { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";

interface ColumnDef {
  field: string;
  header: string;
  body?: (rowData: any) => React.ReactNode;
}

interface TablasProps {
  data: any[];
  columns: ColumnDef[];
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  stripedRows?: boolean;
  showGridlines?: boolean;
  size?: "small" | "normal" | "large";
  tableStyle?: React.CSSProperties;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const Tablas: React.FC<TablasProps> = ({
  data,
  columns,
  paginator = true,
  rows = 5,
  rowsPerPageOptions = [5, 10, 25, 50],
  stripedRows = true,
  showGridlines = true,
  size = "normal",
  tableStyle = { minWidth: "50rem" },
  searchable = true,
  searchPlaceholder = "Buscar...",
}) => {
  const [globalValue, setGlobalValue] = useState<string>("");
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const onGlobalFilterChange = (value: string) => {
    setGlobalValue(value);
    setFilters((prev: any) => ({
      ...prev,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    }));
  };

  const header = useMemo(
    () =>
      !searchable ? null : (
        <div className="flex justify-content-end">
          <span className="p-input-icon-left">
            {/* <i className="pi pi-search" /> */}
            <InputText
              value={globalValue}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </span>
        </div>
      ),
    [globalValue, searchable, searchPlaceholder]
  );

  return (
    <div className="card">
      <DataTable
        value={data}
        paginator={paginator}
        rows={rows}
        rowsPerPageOptions={rowsPerPageOptions}
        stripedRows={stripedRows}
        showGridlines={showGridlines}
        size={size}
        tableStyle={tableStyle}
        header={header as any}
        filters={filters}
        globalFilterFields={columns.map((c) => c.field)}
        emptyMessage="No se encontraron resultados"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
      >
        {columns.map((col, i) => (
          <Column key={i} field={col.field} header={col.header} body={col.body} />
        ))}
      </DataTable>
    </div>
  );
};

export default Tablas;
