import InterviewPage from "../_components/InterviewPage";


export default async function page({ params }) {

    const param = await params;
    const interviewId = param.id;

    console.log('📄 Meeting page loaded with params:', param);
    console.log('🆔 Extracted interviewId:', interviewId);
    console.log('🔍 typeof interviewId:', typeof interviewId);

    return (
        <>
            <div className="bg-gray-50">
                <InterviewPage interviewId={interviewId} />
            </div>
        </>
    );
}
