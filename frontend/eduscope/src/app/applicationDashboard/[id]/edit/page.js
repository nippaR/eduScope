"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import LOGO from "@/app/Assets/EduScope.png";

import { Button } from "@/components/ui/button";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
    } from "@/components/ui/form";
    import { Input } from "@/components/ui/input";
    import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
    } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Breadcrumb from "./BreadCrumb";

    /* ---------- Constants ---------- */
    const GRADES = [
    "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5",
    "Grade 6","Grade 7","Grade 8","Grade 9","Grade 10",
    "Grade 11","Grade 12","Grade 13",
    ];
    const EXTRA_OPTIONS = ["Sports", "Music", "Art", "Debate", "Scouts", "Coding Club"];

    const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    ];

    const MAX_IMG_MB = 5;
    const MAX_DOC_MB = 10;
    const toMB = (bytes) => bytes / (1024 * 1024);

    /* ---------- Zod Schema (same as create, plus status) ---------- */
    const fileOptional = z.instanceof(File).optional();

    const imageFile = fileOptional
    .refine((file) => !file || file.type.startsWith("image/"), { message: "Only image files allowed" })
    .refine((file) => !file || toMB(file.size) <= MAX_IMG_MB, { message: `Image ≤ ${MAX_IMG_MB} MB` });

    const docFile = fileOptional
    .refine((file) => !file || ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
        { message: "Only PDF or DOC/DOCX allowed" })
    .refine((file) => !file || toMB(file.size) <= MAX_DOC_MB, { message: `Document ≤ ${MAX_DOC_MB} MB` });

    const FormSchema = z.object({
    applicant: z.string().min(1, "Select an applicant"),
    apply_grade: z.string().min(1, "Select a grade"),
    status: z.enum(["pending","approved","rejected"], { required_error: "Select a status" }),
    extra_curriculars_checked: z.array(z.string()).optional(),
    extra_curriculars_other: z.string().trim().optional(),
    photo: imageFile,
    birth_certificate: docFile,
    health_record: docFile,
    });

    /* ---------- Component ---------- */
    export default function ApplicationEditForm() {
    const { id } = useParams();
    const router = useRouter();

    const apiBase = React.useMemo(() => {
        const b = process.env.NEXT_PUBLIC_API_URL || "";
        return b.endsWith("/") ? b : `${b}/`;
    }, []);

    const [applicants, setApplicants] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [errorMsg, setErrorMsg] = React.useState("");

    // existing file urls (for preview/download)
    const [existing, setExisting] = React.useState({
        photo: "", birth_certificate: "", health_record: ""
    });

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
        applicant: "",
        apply_grade: "",
        status: "pending",
        extra_curriculars_checked: [],
        extra_curriculars_other: "",
        photo: undefined,
        birth_certificate: undefined,
        health_record: undefined,
        },
    });

    const buildFileUrl = (p) => (p ? (p.startsWith("http") ? p : `${apiBase}${p}`) : "");

    /* ---------- Load options + application ---------- */
    React.useEffect(() => {
        async function loadAll() {
        try {
            setLoading(true);
            setErrorMsg("");

            const [applicantsRes, appRes] = await Promise.all([
            fetch(`${apiBase}Applicant/`, { cache: "no-store" }),
            fetch(`${apiBase}Application/${id}/`, { cache: "no-store" }),
            ]);
            if (!applicantsRes.ok) throw new Error("Failed to load applicants");
            if (!appRes.ok) throw new Error("Failed to load application");

            const [appsData, appData] = await Promise.all([applicantsRes.json(), appRes.json()]);
            setApplicants(Array.isArray(appsData) ? appsData : []);

            // Split extra_curriculars into checked/other based on EXTRA_OPTIONS
            const extras = Array.isArray(appData.extra_curriculars) ? appData.extra_curriculars : [];
            const checked = extras.filter((x) => EXTRA_OPTIONS.includes(x));
            const other = extras.filter((x) => !EXTRA_OPTIONS.includes(x)).join(", ");

            // reset form with loaded values
            form.reset({
            applicant: String(appData.applicant ?? appData.applicant_id ?? ""),
            apply_grade: appData.apply_grade ?? "",
            status: appData.status ?? "pending",
            extra_curriculars_checked: checked,
            extra_curriculars_other: other,
            photo: undefined,
            birth_certificate: undefined,
            health_record: undefined,
            });

            setExisting({
            photo: buildFileUrl(appData.photo),
            birth_certificate: buildFileUrl(appData.birth_certificate),
            health_record: buildFileUrl(appData.health_record),
            });
        } catch (e) {
            setErrorMsg(e.message || "Something went wrong loading data");
        } finally {
            setLoading(false);
        }
        }
        if (id) loadAll();
    }, [apiBase, id, form]);

    // photo preview when selecting a new file
    const watchPhoto = form.watch("photo");
    const [photoPreview, setPhotoPreview] = React.useState(null);
    React.useEffect(() => {
        if (watchPhoto && watchPhoto instanceof File) {
        const url = URL.createObjectURL(watchPhoto);
        setPhotoPreview(url);
        return () => URL.revokeObjectURL(url);
        }
        setPhotoPreview(null);
    }, [watchPhoto]);

    /* ---------- Submit ---------- */
    async function onSubmit(values) {
        // Merge checked + other (comma separated to array)
        const extrasOtherParts = values.extra_curriculars_other
        ? values.extra_curriculars_other.split(",").map(s => s.trim()).filter(Boolean)
        : [];
        const extras = [...(values.extra_curriculars_checked || []), ...extrasOtherParts];

        const fd = new FormData();
        fd.append("applicant", values.applicant);               // OneToOne FK id
        fd.append("apply_grade", values.apply_grade);
        fd.append("status", values.status);
        fd.append("extra_curriculars", JSON.stringify(extras));

        // Only append files if new files were selected
        if (values.photo) fd.append("photo", values.photo);
        if (values.birth_certificate) fd.append("birth_certificate", values.birth_certificate);
        if (values.health_record) fd.append("health_record", values.health_record);

        try {
        const res = await fetch(`${apiBase}Application/${id}/`, {
            method: "PATCH", // partial update is typical
            body: fd,
        });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || `Request failed with ${res.status}`);
        }
        toast.success("Application updated", { description: "Changes saved successfully." });
        router.push(`/applicationDashboard/${id}`);
        } catch (error) {
        console.error(error);
        toast.error("Update failed", { description: error.message });
        }
    }

    if (loading) return <div className="p-6">Loading application…</div>;
    if (errorMsg) return <div className="p-6 text-red-600">Error: {errorMsg}</div>;

    return (
        <div>

        <main className="grow flex flex-col items-center py-6">
            
            <div className="w-full flex justify-end mb-4 px-15 mt-5">
                <Breadcrumb />
            </div>


            <div className="bg-white shadow-md rounded-md p-3 w-6xl grid grid-cols-2 gap-2 sticky top-0 z-10 mb-5">
                <h3 className="text-2xl font-bold text-orange-500">Applicant Dashboard</h3>
                <Image src={LOGO} alt="EduScope Logo" className="w-48 h-10 justify-self-end" />
            </div>



        <Form {...form}>
            <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-4xl p-10 bg-white rounded-md shadow-md border border-orange-400 mx-auto mb-10"
            >
            {/* Applicant (OneToOne) */}
            <FormField
                control={form.control}
                name="applicant"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Applicant</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled>
                    <SelectTrigger><SelectValue placeholder="Select Applicant" /></SelectTrigger>
                    <SelectContent>
                        {applicants.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                            {a.first_name} {a.last_name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Applicant is linked One-to-One and cannot be changed here.</p>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Grade + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FormField
                control={form.control}
                name="apply_grade"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Applying Grade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                        <SelectContent>
                        {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                        {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            {/* Extra-curriculars */}
            <FormField
                control={form.control}
                name="extra_curriculars_checked"
                render={() => (
                <FormItem>
                    <FormLabel>Extra-curriculars</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                    {EXTRA_OPTIONS.map((label) => (
                        <FormField
                        key={label}
                        control={form.control}
                        name="extra_curriculars_checked"
                        render={({ field }) => {
                            const checked = field.value?.includes(label) ?? false;
                            return (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={(v) => {
                                    const set = new Set(field.value || []);
                                    if (v) set.add(label);
                                    else set.delete(label);
                                    field.onChange(Array.from(set));
                                    }}
                                />
                                </FormControl>
                                <span className="text-sm">{label}</span>
                            </FormItem>
                            );
                        }}
                        />
                    ))}
                    </div>

                    <div className="mt-3">
                    <FormLabel className="text-sm">Other (comma separated)</FormLabel>
                    <FormField
                        control={form.control}
                        name="extra_curriculars_other"
                        render={({ field }) => (
                        <FormControl>
                            <Input placeholder="e.g., Chess, Drama" {...field} />
                        </FormControl>
                        )}
                    />
                    </div>
                </FormItem>
                )}
            />

            {/* Files */}
            <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Applicant Photo</FormLabel>
                    <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                    </FormControl>

                    {/* Existing preview or selected preview */}
                    {(photoPreview || existing.photo) && (
                    <div className="mt-2 flex items-center gap-3">
                        <img
                        src={photoPreview || existing.photo}
                        alt="Photo preview"
                        className="h-32 rounded-md border"
                        />
                        {existing.photo && !photoPreview && (
                        <a href={existing.photo} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                            Open current
                        </a>
                        )}
                    </div>
                    )}
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FormField
                control={form.control}
                name="birth_certificate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Birth Certificate (PDF/DOC/DOCX)</FormLabel>
                    <FormControl>
                        <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => field.onChange(e.target.files?.[0])} />
                    </FormControl>
                    {existing.birth_certificate && (
                        <div className="mt-2 flex items-center gap-3">
                        <a href={existing.birth_certificate} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 break-all">
                            Open current file
                        </a>
                        <a href={existing.birth_certificate} download className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50">
                            Download
                        </a>
                        </div>
                    )}
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="health_record"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Health Record (PDF/DOC/DOCX)</FormLabel>
                    <FormControl>
                        <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => field.onChange(e.target.files?.[0])} />
                    </FormControl>
                    {existing.health_record && (
                        <div className="mt-2 flex items-center gap-3">
                        <a href={existing.health_record} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 break-all">
                            Open current file
                        </a>
                        <a href={existing.health_record} download className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50">
                            Download
                        </a>
                        </div>
                    )}
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.refresh()}>
                Reset
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>
            </form>
        </Form>

        </main>
        </div>
    );
}
