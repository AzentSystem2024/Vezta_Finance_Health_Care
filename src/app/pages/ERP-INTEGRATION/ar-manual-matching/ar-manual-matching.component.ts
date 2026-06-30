import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxLoadPanelModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
  DxDateBoxModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services/data.service';
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-ar-manual-matching',
  templateUrl: './ar-manual-matching.component.html',
  styleUrls: ['./ar-manual-matching.component.scss'],
})
export class ARManualMatchingComponent {
  @ViewChild('receiptGrid', {
    static: false,
  })
  receiptGrid!: DxDataGridComponent;
  @ViewChild('invoiceGrid', {
    static: false,
  })
  invoiceGrid!: DxDataGridComponent;
  receiptData: any[] = [];
  invoiceData: any[] = [];
  currentReferenceNo: string | null = null;
  isMatchingLoading: boolean = false;
  receiptColumns = [
    {
      dataField: 'ReceiptNo',
      caption: 'Receipt No',
    },
    {
      dataField: 'Date',
      caption: 'Date',
      dataType: 'date',
    },
    {
      dataField: 'Customer',
      caption: 'Customer',
    },
    {
      dataField: 'ReferenceNo',
      caption: 'Reference No',
    },
    {
      dataField: 'ServiceCode',
      caption: 'Service Code',
    },
    {
      dataField: 'Amount',
      caption: 'Amount',
      format: '#,##0.00',
    },
    {
      dataField: 'RejectedAmount',
      caption: 'Rejected Amount',
      format: '#,##0.00',
    },
    {
      dataField: 'RejectedReason',
      caption: 'Rejected Reason',
    },
  ];
  invoiceColumns = [
    {
      dataField: 'InvoiceNo',
      caption: 'Invoice No',
    },
    {
      dataField: 'Date',
      caption: 'Date',
      dataType: 'date',
    },
    {
      dataField: 'Customer',
      caption: 'Customer',
    },
    {
      dataField: 'ServiceCode',
      caption: 'Service Code',
    },
    {
      dataField: 'Amount',
      caption: 'Amount',
      format: '#,##0.00',
    },
  ];
  isFilterOpened: boolean = false;
  currentFilter: string = 'auto';
  showFilterRow: boolean = false;

  // Manual Matching Button Options
  MatchingButtonOptions = {
    text: 'Matching',
    icon: '',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Match selected receipts with invoices',
    onClick: () => {
      this.performMatching();
    },
    elementAttr: {
      class: 'add-button',
    },
  };

  // Refresh button options
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh Data',
    stylingMode: 'contained',
    elementAttr: {
      class: 'toolbar-icon-btn',
    },
    onClick: () => this.fetchData(),
  };

  // Search button options
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: {
      class: 'toolbar-icon-btn',
    },
    onClick: () => this.toggleFilters(),
  };
  
  constructor(private dataService: DataService) {
    this.fetchData();
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    this.showFilterRow = !this.showFilterRow;
  }

  fetchData() {
    const payload = {
      CompanyID: this.dataService.selected_Company_id,
    };
    if (this.receiptGrid && this.receiptGrid.instance) {
      this.receiptGrid.instance.beginCustomLoading('Loading...');
    }
    this.dataService.getARManualMatchingReceiptList(payload).subscribe({
      next: (res: any) => {
        if (this.receiptGrid && this.receiptGrid.instance) {
          this.receiptGrid.instance.endCustomLoading();
        }
        if (res.flag === '1' && res.data) {
          this.receiptData = res.data;
        } else {
          this.receiptData = [];
        }
      },
      error: (err) => {
        if (this.receiptGrid && this.receiptGrid.instance) {
          this.receiptGrid.instance.endCustomLoading();
        }
        this.receiptData = [];
      },
    });
    this.invoiceData = [];
  }

  onReceiptSelectionChanged(e: any) {
    const selectedReceipts = e.selectedRowsData;
    if (selectedReceipts.length > 0) {
      const firstRef = selectedReceipts[0].ReferenceNo;
      const hasDifferentRef = selectedReceipts.some(
        (r: any) => r.ReferenceNo !== firstRef,
      );
      if (hasDifferentRef) {
        notify(
          'Can only select rows with the same Reference No.',
          'warning',
          3000,
        );
        e.component.deselectRows(e.currentSelectedRowKeys);
        return;
      }
      if (!firstRef) {
        this.invoiceData = [];
        this.currentReferenceNo = null;
        return;
      }
      if (this.currentReferenceNo === firstRef) {
        return; // No need to call API again for the same reference number
      }
      this.currentReferenceNo = firstRef;
      const payload = {
        ReferenceNo: firstRef,
      };
      if (this.invoiceGrid && this.invoiceGrid.instance) {
        this.invoiceGrid.instance.beginCustomLoading('Loading...');
      }
      this.dataService.getARManualMatchingInvoiceList(payload).subscribe({
        next: (res: any) => {
          if (this.invoiceGrid && this.invoiceGrid.instance) {
            this.invoiceGrid.instance.endCustomLoading();
          }
          if (res.flag === '1' && res.data) {
            this.invoiceData = res.data;
          } else {
            this.invoiceData = [];
          }
        },
        error: (err) => {
          if (this.invoiceGrid && this.invoiceGrid.instance) {
            this.invoiceGrid.instance.endCustomLoading();
          }
          this.invoiceData = [];
        },
      });
    } else {
      this.invoiceData = [];
      this.currentReferenceNo = null;
    }
  }

  performMatching() {
    const selectedReceipts = this.receiptGrid.instance.getSelectedRowsData();
    const selectedInvoices = this.invoiceGrid.instance.getSelectedRowsData();
    if (selectedReceipts.length === 0 || selectedInvoices.length === 0) {
      notify(
        'Please select at least one receipt and one invoice to match.',
        'warning',
        3000,
      );
      return;
    }
    const payload = {
      ReceiptDetailID: selectedReceipts
        .map((r: any) => r.ReceiptDetailID)
        .filter((id: any) => id)
        .join(','),
      InvoiceID: selectedInvoices
        .map((i: any) => i.InvoiceID)
        .filter((id: any) => id)
        .join(','),
    };

    this.isMatchingLoading = true;
    this.dataService.processARManualMatching(payload).subscribe({
      next: (res: any) => {
        this.isMatchingLoading = false;

        if (res.flag === '1') {
          notify(res.message || 'Matching successful', 'success', 3000);
        } else if (res.message) {
          notify(res.message, 'warning', 3000);
        } else {
          notify('Matching successful', 'success', 3000);
        }

        // Refresh first grid
        this.fetchData();

        // Clear selections
        if (this.receiptGrid && this.receiptGrid.instance) {
          this.receiptGrid.instance.clearSelection();
        }
        if (this.invoiceGrid && this.invoiceGrid.instance) {
          this.invoiceGrid.instance.clearSelection();
        }

        // Empty second grid
        this.invoiceData = [];
        this.currentReferenceNo = null;
      },
      error: (err) => {
        this.isMatchingLoading = false;
        notify('Error during matching', 'error', 3000);
      },
    });
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DepartmentFormModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxSelectBoxModule,
    DxDateBoxModule,
  ],
  providers: [],
  declarations: [ARManualMatchingComponent],
  exports: [ARManualMatchingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ARManualMatchingModule {}
