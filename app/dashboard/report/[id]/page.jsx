import ReportComponent from "../_components/ReportComponent";

export default async function page({ params }) {
  const param = await params;
  const id = param?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ReportComponent id={id} />
    </div>
  );
}
