import { useSalesData } from "@/hooks/useSalesData";

function MetricSales() {
  const { sales, metrics, loading, error, refetch } = useSalesData();

  return <></>;
}

export default MetricSales;
