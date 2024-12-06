import { Component } from "@angular/core";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { AgGridAngular } from "@ag-grid-community/angular";
// NOTE: Angular CLI does not support component CSS imports: angular-cli/issues/23273
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import "./styles.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import {
  ColDef,
  ColGroupDef,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
  createGrid,
} from "@ag-grid-community/core";
import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel";
import { MasterDetailModule } from "@ag-grid-enterprise/master-detail";
import { MenuModule } from "@ag-grid-enterprise/menu";
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  MasterDetailModule,
  MenuModule,
]);
import { DetailCellRenderer } from "./detail-cell-renderer.component";
import { IAccount } from "./interfaces";

declare var window: any;

@Component({
  selector: "my-app",
  standalone: true,
  imports: [AgGridAngular, HttpClientModule, DetailCellRenderer],
  template: `<div class="example-wrapper">
    <div style="margin-bottom: 5px">
      <button (click)="printDetailGridInfo()">Print Detail Grid Info</button>
      <button (click)="expandCollapseAll()">Toggle Expand / Collapse</button>
    </div>
    <ag-grid-angular
      style="width: 100%; height: 100%;"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      [masterDetail]="true"
      [detailRowHeight]="detailRowHeight"
      [detailCellRenderer]="detailCellRenderer"
      [rowData]="rowData"
      [class]="themeClass"
      (firstDataRendered)="onFirstDataRendered($event)"
      (gridReady)="onGridReady($event)"
    />
  </div> `,
})
export class AppComponent {
  private gridApi!: GridApi<IAccount>;

  public columnDefs: ColDef[] = [
    // group cell renderer needed for expand / collapse icons
    { field: "name", cellRenderer: "agGroupCellRenderer" },
    { field: "account" },
    { field: "calls" },
    { field: "minutes", valueFormatter: "x.toLocaleString() + 'm'" },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
  };
  public detailRowHeight = 310;
  public detailCellRenderer: any = DetailCellRenderer;
  public rowData!: IAccount[];
  public themeClass: string =
    "ag-theme-quartz-dark";

  constructor(private http: HttpClient) {}

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(() => {
      params.api.getDisplayedRowAtIndex(1)!.setExpanded(true);
    }, 0);
  }

  expandCollapseAll() {
    this.gridApi.forEachNode(function (node) {
      node.expanded = !!window.collapsed;
    });
    window.collapsed = !window.collapsed;
    this.gridApi.onGroupExpandedOrCollapsed();
  }

  printDetailGridInfo() {
    console.log("Currently registered detail grid's: ");
    this.gridApi.forEachDetailGridInfo(function (detailGridInfo) {
      console.log(detailGridInfo);
    });
  }

  onGridReady(params: GridReadyEvent<IAccount>) {
    this.gridApi = params.api;

    this.http
      .get<
        IAccount[]
      >("https://www.ag-grid.com/example-assets/master-detail-data.json")
      .subscribe((data) => {
        this.rowData = data;
      });
  }
}
