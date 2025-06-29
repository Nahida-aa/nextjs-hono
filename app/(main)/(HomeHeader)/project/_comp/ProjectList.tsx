"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  Tooltip,
} from "@heroui/react";
import { BoxIcon, ChevronDownIcon, CopyIcon, EllipsisVertical, Plus, PlusIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { projects } from "./data";
import  {SVGProps} from "react";
import {
  type Selection,
  type ChipProps,
  type SortDescriptor,
} from "@heroui/react";
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
type Project = (typeof projects)[0];
import NextImage from 'next/image'
import { CopyToClipboard } from "react-copy-to-clipboard";
import Link from "next/link";

export const columns = [
  {name: "Name", uid: "slug", sortable: true},
  {name: "Type", uid: "type", sortable: true},
  {name: "ID", uid: "id", sortable: true},
  {name: "Status", uid: "status", sortable: true},
  {name: "Created At", uid: "created_at", sortable: true},
  {name: "Updated At", uid: "updated_at"},
  {name: "Visibility", uid: "visibility"},
  {name: "Edit", uid: "actions"},
];

export const statusOptions = [
  {name: "Draft", uid: "draft"},
  {name: "Paused", uid: "paused"},
  {name: "Vacation", uid: "vacation"},
];

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};


const INITIAL_VISIBLE_COLUMNS =  ["slug", "id", "type", "status", "actions" ]

export function ProjectList() {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredProjects = [...projects];

    if (hasSearchFilter) {
      filteredProjects = filteredProjects.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredProjects = filteredProjects.filter((user) =>
        Array.from(statusFilter).includes(user.status),
      );
    }

    return filteredProjects;
  }, [projects, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Project, b: Project) => {
      const first = a[sortDescriptor.column as keyof Project] as number;
      const second = b[sortDescriptor.column as keyof Project] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((project: Project, columnKey: React.Key) => {
    const cellValue = project[columnKey as keyof Project];

    switch (columnKey) {
      case "slug":
        return <div className="flex items-center gap-2">
          <Link href={`/project/${project.slug}`} >
            {project.icon_url ? <NextImage src={project.icon_url} width={50} height={50} alt={project.name} /> : <BoxIcon />}
          </Link>
          <Link href={`/project/${project.slug}`} className="hover:underline text-primary-300">
            {project.slug}
          </Link>
        </div>
      case "id": // 显示前8位,提供复制功能
        return  <Tooltip content={cellValue}>
        <Chip className="capitalize items-center " color={statusColorMap[project.status]} size="sm" variant="flat">

            <span className="max-w-[8ch] text-ellipsis overflow-hidden whitespace-nowrap  inline-block">{cellValue}</span>
            <CopyToClipboard text={cellValue}>
                <Button isIconOnly size="sm" variant="light">
                  <CopyIcon className="text-default-300" size={16} />
                </Button>
            </CopyToClipboard>
        </Chip>
        </Tooltip>
      case "type":
        return <div className="flex flex-col">
          <p className="text-bold text-small capitalize">{cellValue}</p>
        </div>
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[project.status]} size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <SettingsIcon />
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon size={20} />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon size={20} className="text-small" />} variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon size={20} className="text-small" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button color="primary" endContent={<PlusIcon size={20} />}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {projects.length} users</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    projects.length,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <Table isHeaderSticky 
      // isStriped 
      aria-label="Rows actions table with custom cells, pagination and sorting"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys} // 选择行为
      selectionBehavior="toggle"
      onRowAction={(key) => {}} // 声明点击行行为, 以取消默认的选择行为

      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={"No users found"} items={sortedItems}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
