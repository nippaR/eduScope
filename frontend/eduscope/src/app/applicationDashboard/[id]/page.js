'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import LOGO from '@/app/Assets/EduScope.png';
import { Badge } from "@/components/ui/badge";
import BDView from './BDView';


export default function ApplicationView() {
    const { id } = useParams();

    const apiBase = useMemo(() => {
        const b = process.env.NEXT_PUBLIC_API_URL || '';
        return b.endsWith('/') ? b : `${b}/`;
    }, []);

    const [application, setApplication] = useState(null);
    const [applicant, setApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        async function load() {
        try {
            setLoading(true);
            setErrorMsg('');

            const res = await fetch(`${apiBase}Application/${id}/`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to load application');
            const app = await res.json();
            setApplication(app);

            const applicantKey =
            app.applicant_id ?? app.applicantId ?? app.applicant ?? app.ApplicantId;

            if (!app.applicant_name && applicantKey != null) {
            const aRes = await fetch(`${apiBase}Applicant/${applicantKey}/`, { cache: 'no-store' });
            if (aRes.ok) {
                const a = await aRes.json();
                setApplicant(a);
            }
            }
        } catch (e) {
            setErrorMsg(e?.message || 'Something went wrong loading data');
        } finally {
            setLoading(false);
        }
        }
        if (id) load();
    }, [apiBase, id]);

    if (loading) return <div className="text-center py-10">Loading application...</div>;
    if (errorMsg) return <div className="text-center text-red-500 py-10">Error: {errorMsg}</div>;

    const applicantFullName = applicant
        ? `${applicant.first_name ?? ''} ${applicant.last_name ?? ''}`.trim() ||
        applicant.email ||
        `Applicant #${applicant.id}`
        : application?.applicant_name || `Application #${application?.id || ''}`;

    const submittedDate = application?.submission_date || application?.submitted_at;
    const submittedDateText = submittedDate
        ? new Date(submittedDate).toLocaleDateString()
        : '—';

    const buildFileUrl = (path) =>
        path ? (path.startsWith('http') ? path : `${apiBase}${path}`) : '';

    const fileNameFromUrl = (url) => (url ? url.split('/').pop() : '');


    return (
        // Center the whole page content
        <div>
        <div className="w-full flex justify-end mb-4 px-15 mt-5">
            <BDView />
        </div>
        <main className="min-h-screen flex justify-center bg-gray-50">

        {/* Constrain width and center */}
        <div className="w-full max-w-4xl mx-auto px-4 py-6">
            {/* Header card */}
            <div className="bg-white shadow-md rounded-md p-3 grid grid-cols-2 gap-2 sticky top-0 z-10">
            <h3 className="text-2xl font-bold text-orange-500">
                {applicantFullName} Application
            </h3>
            <div className="justify-self-end">
                <Image src={LOGO} alt="EduScope Logo" className="w-48 h-10" />
            </div>
            </div>

            {application ? (
            <div className="bg-white shadow-md rounded-md p-6  text-gray-700">
                <div className='grid grid-cols-3 gap-4 mb-4'>
                    <div>
                        {application.photo ? (

                                <img
                                src={
                                    application.photo.startsWith('http')
                                    ? application.photo
                                    : `${apiBase}${application.photo}`
                                }
                                alt="Applicant Photo"
                                className="rounded-md shadow-md w-32 h-auto object-contain"
                                />
                            ) : (
                            <p>No photo available</p>
                            )}
                    </div>
                        <p><Badge className="bg-orange-400">Status: {application.status ?? '—'}</Badge></p>
                        <p> Submission Date: {submittedDateText}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 mb-5">
                    <p><strong>Applicant Name: </strong> {applicantFullName}</p>
                    <p><strong>Applying Grade: </strong> {application?.apply_grade ?? '—'}</p>
                </div>
                    <p className="mt-6 mb-5">
                        <strong>Extra Curriculum Activities:</strong>{' '}
                        {application.extra_curriculars?.length
                            ? application.extra_curriculars.join(' • ')
                            : '—'}
                    </p>

                   {/* Birth Certificate */}
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                        <strong>Birth Certificate:</strong>
                        {application?.birth_certificate ? (
                            <>
                            {(() => {
                                const url = buildFileUrl(application.birth_certificate);
                                const name = fileNameFromUrl(url);
                                const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
                                const isPdf = /\.pdf$/i.test(name);

                                return (
                                <>
                                    {/* filename link */}
                                    <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-600 break-all"
                                    title={url}
                                    >
                                    {name || 'Open file'}
                                    </a>

                                    {/* download button (best-effort; some servers require Content-Disposition) */}
                                    <a
                                    href={url}
                                    download
                                    className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50"
                                    >
                                    Download
                                    </a>

                                    {/* optional small preview */}
                                    {isImage && (
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        <img
                                        src={url}
                                        alt="Birth certificate preview"
                                        className="h-16 w-auto rounded border"
                                        />
                                    </a>
                                    )}
                                    {isPdf && (
                                    <span className="text-xs text-gray-500">(PDF)</span>
                                    )}
                                </>
                                );
                            })()}
                            </>
                        ) : (
                            '—'
                        )}
                        </div>

                        {/* Health Certificate */}
                        <div className="flex flex-wrap items-center gap-3">
                        <strong>Health Certificate:</strong>
                        {application?.health_record ? (
                            <>
                            {(() => {
                                const url = buildFileUrl(application.health_record);
                                const name = fileNameFromUrl(url);
                                const isPdf = /\.pdf$/i.test(name);
                                const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);

                                return (
                                <>
                                    <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-600 break-all"
                                    title={url}
                                    >
                                    {name || 'Open file'}
                                    </a>
                                    <a
                                    href={url}
                                    download
                                    className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50"
                                    >
                                    Download
                                    </a>
                                    {isImage && (
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        <img
                                        src={url}
                                        alt="Health certificate preview"
                                        className="h-16 w-auto rounded border"
                                        />
                                    </a>
                                    )}
                                    {isPdf && <span className="text-xs text-gray-500">(PDF)</span>}
                                </>
                                );
                            })()}
                            </>
                        ) : (
                            '—'
                        )}
                        </div>


            </div>
            ) : (
            <p>No application data available.</p>
            )}
        </div>
        </main>
        </div>
    );
}
