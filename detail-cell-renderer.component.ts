import {
  AgGridAngular,
  ICellRendererAngularComp,
} from "@ag-grid-community/angular";
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
} from "@ag-grid-community/core";
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface IAccount {
  name: string;
  account: string;
  calls: number;
  minutes: number;
  callRecords: ICallRecord[];
}

export interface ICallRecord {
  callId: string;
  direction: string;
  number: string;
  duration: number;
  switchCode: string;
}

export interface KeyValuePair {
  key: string;
  value: string | number;
}

interface ListItem {
  id: string;
  heading: string;
  values: string[];
  isEditing: boolean;
}

@Component({
  standalone: true,
  imports: [AgGridAngular, CommonModule],
  template: `
    <div class="detail-container">
      <div class="left-panel">
        <div class="grids-container">
          <div
            *ngFor="let gridData of allGridsData; let i = index"
            class="grid-section"
          >
            <h3>{{ gridTitles[i] }}</h3>
            <div class="grid-kv-container">
              <div class="kv-pair" *ngFor="let pair of gridKeyValues[i]">
                <span class="kv-key">{{ pair.key }}:</span>
                <span class="kv-value">{{ pair.value }}</span>
              </div>
            </div>
            <ag-grid-angular
              class="detail-grid"
              [columnDefs]="commonColDefs"
              [rowData]="gridData"
              [defaultColDef]="defaultColDef"
              [class]="themeClass"
              (gridReady)="onGridReady($event, i)"
            />
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-header">
          <h3>Call Categories</h3>
        </div>
        <div class="list-wrapper">
          <div class="list-container">
            <div *ngFor="let item of listEditItems" class="list-item">
              <!-- Main View -->
              <div class="item-content" *ngIf="!item.isEditing">
                <div class="item-header">{{ item.heading }}</div>
                <div class="values-group">
                  <span
                    *ngFor="let value of item.values"
                    class="value-chip"
                    [title]="value"
                    (click)="toggleValueExpand(value)"
                    [class.expanded]="expandedValues.includes(value)"
                  >
                    {{ value }}
                  </span>
                </div>
                <button class="edit-btn" (click)="toggleEdit(item)">
                  Edit
                </button>
              </div>

              <!-- Edit View -->
              <div class="edit-content" *ngIf="item.isEditing">
                <div class="item-header">{{ item.heading }}</div>
                <div class="editable-values">
                  <div *ngFor="let value of item.values" class="value-item">
                    <span>{{ value }}</span>
                    <i class="delete-icon" (click)="deleteValue(item, value)"
                      >🗑️</i
                    >
                  </div>
                </div>
                <div class="add-new-value">
                  <input #newValue placeholder="Add new value" />
                  <button
                    (click)="
                      addValue(item, newValue.value); newValue.value = ''
                    "
                  >
                    Add
                  </button>
                </div>
                <div class="edit-actions">
                  <button class="save-btn" (click)="saveChanges(item)">
                    Save
                  </button>
                  <button class="cancel-btn" (click)="toggleEdit(item)">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DetailCellRenderer implements ICellRendererAngularComp {
  params!: ICellRendererParams;
  themeClass: string = "ag-theme-quartz";
  gridApis: GridApi[] = [];

  keyValuePairs: KeyValuePair[] = [];
  gridTitles: string[] = [
    "Incoming Calls",
    "Outgoing Calls",
    "Long Duration Calls",
    "Short Duration Calls",
  ];

  commonColDefs: ColDef[] = [
    { field: "callId", headerName: "Call ID" },
    { field: "direction" },
    { field: "number", headerName: "Phone Number" },
    {
      field: "duration",
      headerName: "Duration (s)",
      valueFormatter: (params) => `${params.value.toLocaleString()}s`,
    },
    { field: "switchCode" },
  ];

  defaultColDef: ColDef = {
    flex: 1,
    sortable: true,
    filter: true,
  };

  allGridsData: ICallRecord[][] = [];
  // Add this property to store grid-specific key-value pairs
  gridKeyValues: KeyValuePair[][] = [];

  agInit(params: ICellRendererParams): void {
    this.params = params;
    const data = params.data;

    // Filter data for different grids
    this.allGridsData = [
      data.callRecords.filter((r) => r.direction === "In"),
      data.callRecords.filter((r) => r.direction === "Out"),
      data.callRecords.filter((r) => r.duration > 100),
      data.callRecords.filter((r) => r.duration <= 100),
    ];

    // Initialize grid-specific key-value pairs
    this.gridKeyValues = this.allGridsData.map((gridData) => [
      { key: "Total Records", value: gridData.length },
      {
        key: "Total Duration",
        value: `${gridData.reduce((sum, call) => sum + call.duration, 0)}s`,
      },
      {
        key: "Avg Duration",
        value: `${Math.round(
          gridData.reduce((sum, call) => sum + call.duration, 0) /
            gridData.length
        )}s`,
      },
      { key: "Last Call", value: gridData[0]?.callId || "N/A" },
    ]);
  }

  onGridReady(params: GridReadyEvent, index: number) {
    this.gridApis[index] = params.api;
    params.api.sizeColumnsToFit();
  }

  onEditItem(item: ICallRecord) {
    console.log("Editing call record:", item);
    // Implement your edit logic here
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  listEditItems: ListItem[] = [
    {
      id: "1",
      heading: "Priority Calls",
      values: [
        "Emergency",
        "VIP",
        "Escalated",
        "High Priority",
        "Urgent Response",
      ],
      isEditing: false,
    },
    {
      id: "2",
      heading: "Call Categories",
      values: [
        "Sales",
        "Support",
        "Technical",
        "Billing",
        "General Inquiry",
        "Partnership",
      ],
      isEditing: false,
    },
    {
      id: "3",
      heading: "Response Time",
      values: ["Immediate", "24 Hours", "48 Hours", "Standard", "Scheduled"],
      isEditing: false,
    },
    {
      id: "4",
      heading: "Customer Segments",
      values: [
        "Enterprise",
        "SMB",
        "Retail",
        "Government",
        "Education",
        "Healthcare",
      ],
      isEditing: false,
    },
    {
      id: "5",
      heading: "Call Outcomes",
      values: [
        "Resolved",
        "Pending",
        "Follow-up Required",
        "Transferred",
        "Callback Scheduled",
      ],
      isEditing: false,
    },
    {
      id: "6",
      heading: "Special Handling",
      values: [
        "Language Support",
        "Technical Expert",
        "Senior Management",
        "Legal Team",
        "Custom Solution",
        "Technical Expert",
        "Senior Management",
        "Legal Team",
        "Custom Solution",
        "Technical Expert",
        "Senior Management",
        "Legal Team",
        "Custom Solution",
      ],
      isEditing: false,
    },
  ];

  toggleEdit(item: ListItem) {
    item.isEditing = !item.isEditing;
  }

  deleteValue(item: ListItem, value: string) {
    item.values = item.values.filter((v) => v !== value);
  }

  addValue(item: ListItem, value: string) {
    if (value.trim()) {
      item.values.push(value.trim());
    }
  }

  saveChanges(item: ListItem) {
    // Implement save logic
    this.toggleEdit(item);
  }

  expandedValues: string[] = [];

  toggleValueExpand(value: string) {
    const index = this.expandedValues.indexOf(value);
    if (index === -1) {
      this.expandedValues.push(value);
    } else {
      this.expandedValues.splice(index, 1);
    }
  }
}
