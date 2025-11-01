"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// ---- Constants ----
const GRADES = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
    "Grade 11", "Grade 12", "Grade 13",
    ];

    const EXTRA_OPTIONS = ["Sports", "Music", "Art", "Debate", "Scouts", "Coding Club"];
    const MAX_IMG_MB = 5;
    const MAX_DOC_MB = 10;
    const toMB = (bytes) => bytes / (1024 * 1024);

    // ---- Validation Schema ----
    const fileOptional = z.instanceof(File).optional();

    const imageFile = fileOptional
    .refine((file) => !file || file.type.startsWith("image/"), { message: "Only image files allowed" })
    .refine((file) => !file || toMB(file.size) <= MAX_IMG_MB, { message: `Image ≤ ${MAX_IMG_MB} MB` });

    const docFile = fileOptional
    .refine(
        (file) =>
        !file ||
        ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
        { message: "Only PDF or DOC/DOCX allowed" }
    )
    .refine((file) => !file || toMB(file.size) <= MAX_DOC_MB, { message: `Document ≤ ${MAX_DOC_MB} MB` });

    const FormSchema = z.object({
    applicant: z.string().min(1, "Select an applicant"),
    apply_grade: z.string().min(1, "Select a grade"),
    extra_curriculars_checked: z.array(z.string()).optional(),
    extra_curriculars_other: z.string().trim().optional(),
    photo: imageFile,
    birth_certificate: docFile,
    health_record: docFile,
    });

    // ---- Component ----
    export default function ApplicationForm() {
    const [applicants, setApplicants] = React.useState([]);
    const [photoPreview, setPhotoPreview] = React.useState(null);

    // Initialize React Hook Form
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
        applicant: "",
        apply_grade: "",
        extra_curriculars_checked: [],
        extra_curriculars_other: "",
        photo: undefined,
        birth_certificate: undefined,
        health_record: undefined,
        },
    });

    // Fetch applicant names
    React.useEffect(() => {
        async function loadApplicants() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}Applicant/`, {
            cache: "no-store",
            });
            const data = await res.json();
            setApplicants(data);
        } catch (error) {
            console.error("Error loading applicants:", error);
        }
        }
        loadApplicants();
    }, []);

    // Preview photo
    const watchPhoto = form.watch("photo");
    React.useEffect(() => {
        if (watchPhoto && watchPhoto instanceof File) {
        const url = URL.createObjectURL(watchPhoto);
        setPhotoPreview(url);
        return () => URL.revokeObjectURL(url);
        }
        setPhotoPreview(null);
    }, [watchPhoto]);

    // Handle form submission
    async function onSubmit(values) {
        const extras = [
        ...(values.extra_curriculars_checked || []),
        ...(values.extra_curriculars_other?.trim() ? [values.extra_curriculars_other.trim()] : []),
        ];

        const fd = new FormData();
        fd.append("applicant", values.applicant);
        fd.append("apply_grade", values.apply_grade);
        fd.append("extra_curriculars", JSON.stringify(extras));
        if (values.photo) fd.append("photo", values.photo);
        if (values.birth_certificate) fd.append("birth_certificate", values.birth_certificate);
        if (values.health_record) fd.append("health_record", values.health_record);
        fd.append("status", "pending");

        try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}Application/`, {
            method: "POST",
            body: fd,
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || `Request failed with ${res.status}`);
        }

        toast.success("Application submitted", { description: "Your details were received successfully!" });
        form.reset();
        setPhotoPreview(null);
        } catch (error) {
        console.error(error);
        toast.error("Submit failed", { description: error.message });
        }
    }

    return (
        <div>

            {/* Header */}
            <div className="p-4 bg-white rounded-md shadow-md w-4xl justify-center mx-auto text-center border border-orange-400 mb-10">
                <h2 className="text-2xl text-orange-500 font-semibold">
                    Add Student Details Form
                </h2>
            </div>

        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-4xl p-10 bg-white rounded-md shadow-md border border-orange-400 mx-auto mb-10">
            
            {/* Applicant Dropdown */}

        <div className="grid grid-cols-2 gap-12">
            <FormField
                control={form.control}
                name="applicant"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Applicant Name</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Applicant Name" />
                    </SelectTrigger>
                    <SelectContent>
                        {applicants.map((applicant) => (
                        <SelectItem key={applicant.id} value={String(applicant.id)}>
                            {applicant.first_name} {applicant.last_name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Grade Dropdown */}
            <FormField
                control={form.control}
                name="apply_grade"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Applying Grade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                    <SelectContent>
                        {GRADES.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />

            </div>

            {/* Extra-Curricular Activities Section */}
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
                                    const arr = new Set(field.value || []);
                                    if (v) arr.add(label);
                                    else arr.delete(label);
                                    field.onChange(Array.from(arr));
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
                    <FormLabel className="text-sm">Other</FormLabel>
                    <FormField
                        control={form.control}
                        name="extra_curriculars_other"
                        render={({ field }) => (
                        <FormControl>
                            <Input placeholder="e.g., Chess, Drama…" {...field} />
                        </FormControl>
                        )}
                    />
                    </div>
                </FormItem>
                )}
            />

            {/* Photo Upload */}
            <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Applicant Photo</FormLabel>
                    <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                    </FormControl>
                    {photoPreview && <img src={photoPreview} alt="Preview" className="h-32 mt-2 rounded-md" />}
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-12">
            {/* Birth Certificate */}
            <FormField
                control={form.control}
                name="birth_certificate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Birth Certificate (PDF/DOC/DOCX)</FormLabel>
                    <FormControl>
                    <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Health Record */}
            <FormField
                control={form.control}
                name="health_record"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Health Record (PDF/DOC/DOCX)</FormLabel>
                    <FormControl>
                    <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => form.reset()}>
                Reset
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
            </div>
            </form>
        </Form>
        </div>
    );
}
