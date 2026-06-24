# 🏢 VendorBridge Complete Procurement Workflow

VendorBridge ERP is a comprehensive, end-to-end B2B procurement platform. This document outlines the complete operational lifecycle supported by the system.

## Step 1: Organization Setup
**Admin Creates System**: The Admin logs in and configures Company Information, Procurement Departments, User Roles, Approval Hierarchy, and Vendor Categories.
**Admin Creates Users**: System roles include Procurement Officer, Manager / Approver, Vendor Accounts, and Additional Admins. (e.g. Rahul → Procurement Officer, Neha → Manager, ABC Pvt Ltd → Vendor).

## Step 2: Vendor Registration
**Option A (Admin Creates Vendor)**: Admin goes to `Vendors → Add Vendor` and inputs details (Company Name, GST, Email, Phone, Address, Category). System generates a Vendor ID (e.g., VND-0001) with Status `Pending`.
**Option B (Vendor Self Registration)**: Vendor signs up directly. Status starts as `Pending Approval`. Once Admin approves, status becomes `Active`.

## Step 3: Procurement Requirement Raised
A department needs products/services (e.g., 100 Office Chairs). The internal request reaches the Procurement Officer.

## Step 4: RFQ Creation
Procurement Officer goes to `RFQs → Create RFQ` and enters Title, Description, Products, Quantity, Specifications, Deadline, and Attachments. System generates an RFQ ID (e.g., RFQ-2026-0001) with Status `Draft`.

## Step 5: Assign Vendors
Procurement Officer selects shortlisted vendors from the system. The system creates an `RFQ Vendor Assignment` and updates the RFQ Status to `Published`.

## Step 6: Vendor Notification
Selected vendors receive an Email ("New RFQ Available"), a Dashboard Notification ("You have been invited to RFQ-2026-0001"), and an Activity Log entry is created.

## Step 7: Vendor Reviews RFQ
Vendor logs into their portal to view RFQ Details, Attachments, Quantities, Deadlines, and T&Cs before deciding to participate.

## Step 8: Vendor Submits Quotation
Vendor opens `Submit Quotation` and enters Price Per Item, Taxes, Delivery Time, Payment Terms, Warranty, and Notes. The system automatically calculates Subtotal, CGST, SGST, and Grand Total. Generates Quotation Number (e.g., QUO-2026-0001) with Status `Submitted`.

## Step 9: Multiple Vendors Submit Quotes
The system securely stores all competing quotations from various vendors (e.g., Vendor A = ₹5,00,000, Vendor B = ₹4,75,000, Vendor C = ₹5,20,000).

## Step 10: Quotation Comparison
Procurement Officer opens the `Comparison Screen`. The system side-by-side compares Price, Delivery timelines, Rating, and Past Performance, automatically highlighting the Lowest Price, Best Delivery, and Best Overall Score.

## Step 11: Vendor Shortlisting
Procurement Officer selects the winning vendor (e.g., Vendor A). The quotation status becomes `Shortlisted`.

## Step 12: Approval Workflow Starts
System automatically creates an `Approval Request` with Status `Pending`.

## Step 13: Manager Receives Approval Request
Manager Dashboard updates to show `Pending Approvals = 1`. A notification is sent: "RFQ Requires Approval".

## Step 14: Approval Review
Manager reviews the full context: RFQ, selected Quotation, Vendor details, Amount, Attachments, and the Comparison matrix.

## Step 15: Manager Decision
**Approve**: Manager enters remarks. Status becomes `Approved`.
**Reject**: Reason required. Status becomes `Rejected`.

## Step 16: Purchase Order Generation
Once approved, the Procurement Officer clicks `Generate Purchase Order`. System automatically creates a PO (e.g., PO-2026-0001) carrying over all details (Vendor, Items, Tax, Terms). Status becomes `Generated`.

## Step 17: PO Sent To Vendor
Vendor receives an Email and Dashboard Notification. Vendor acknowledges the PO, updating status to `Accepted`.

## Step 18: Delivery Process
Vendor delivers goods. Procurement team verifies Quantity, Quality, and Condition. Status updates to `Received`.

## Step 19: Invoice Generation
Procurement Officer clicks `Generate Invoice`. System creates an Invoice (e.g., INV-2026-0001) and auto-calculates Subtotal, CGST, SGST, and Grand Total.

## Step 20: Invoice Actions
Available features include: Preview PDF, Download PDF, Print Invoice, and Send Email.

## Step 21: Vendor Receives Invoice
Vendor receives the Invoice PDF through Email and the Dashboard. Status becomes `Sent`.

## Step 22: Payment Processing
Finance team processes the payment. Invoice Status updates to `Paid`. System stores Payment Date and Transaction Reference.

## Step 23: Procurement Completed
System marks Purchase Order Status as `Completed`, Invoice Status as `Paid`, and RFQ Status as `Closed`.

## Step 24: Activity Logs
Every action generates detailed audit logs (e.g., "Rahul created RFQ-2026-0001", "Neha approved quotation").

## Step 25: Notifications
System automatically generates push notifications for all major milestones (RFQ Published, Quotation Submitted, PO Generated, etc.).

## Step 26: Reports & Analytics
Dashboard continuously computes and displays:
- **Vendor Performance**: Orders Completed, Average Delivery Time, Vendor Rating.
- **Procurement Analytics**: Total RFQs, Quotations, POs, and Invoices.
- **Spending Analytics**: Monthly, Department, Vendor, and Category Spend.
- **Trends**: Monthly Growth, Performance Trends, Approval Times.

---

### Final Lifecycle Summary
Vendor Registration → RFQ Creation → Vendor Assignment → Quotation Submission → Quotation Comparison → Vendor Selection → Approval Workflow → Purchase Order Generation → Vendor Delivery → Invoice Generation → Email / PDF / Print → Payment Processing → Activity Logs → Reports & Analytics → Procurement Completed.
