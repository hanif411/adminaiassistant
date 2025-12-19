// src/app/sales/page.tsx
import HeaderDashboard from "@/components/Header/HeaderDashboard";
import SalesIndex from "@/components/sales/SalesIndex"; // IMPORT KOMPONEN BARU

function SalesPage() {
  return (
    <>
      <HeaderDashboard />
      <SalesIndex />
    </>
  );
}

export default SalesPage;
