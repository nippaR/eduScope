"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
    } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"

    // ---- Constants (tweak as you like) ----
    const GRADES = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","Grade 13"];

    const MAX_IMG_MB = 5;
    const MAX_DOC_MB = 10;
    const toMB = (bytes) => bytes / (1024 * 1024);

    // ---- Zod schema ----
    const fileOptional = z
    .instanceof(File)
    .optional()
    .or(z.any().refine((v) => v === undefined, "Invalid file"));

    const imageFile = fileOptional.refine(
    (file) => !file || file.type.startsWith("image/"),
    { message: "Only image files are allowed." }
    ).refine(
    (file) => !file || toMB(file.size) <= MAX_IMG_MB,
    { message: `Image must be ≤ ${MAX_IMG_MB} MB.` }
    );

    const docFile = fileOptional.refine(
    (file) => !file || ["application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(file.type),
    { message: "Only PDF or DOC/DOCX files are allowed." }
    ).refine(
    (file) => !file || toMB(file.size) <= MAX_DOC_MB,
    { message: `Document must be ≤ ${MAX_DOC_MB} MB.` }
    );

    const FormSchema = z.object({
    applicant: z.string().min(1, "Missing applicant id"), // pass in as prop default
    apply_grade: z.string().min(1, "Select a grade"),
    extra_curriculars_checked: z.array(z.string()).optional(),
    extra_curriculars_other: z.string().trim().optional(),
    photo: imageFile,
    birth_certificate: docFile,
    health_record: docFile,
    });

    export default function ApplicationForm({ applicantId, apiUrl = "/api/applications/" }) {
    
    const [photoPreview, setPhotoPreview] = React.useState(null);

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
        applicant: applicantId ?? "",
        apply_grade: "",
        extra_curriculars_checked: [],
        extra_curriculars_other: "",
        photo: undefined,
        birth_certificate: undefined,
        health_record: undefined,
        },
        mode: "onSubmit",
    });

    // Preview for image
    const watchPhoto = form.watch("photo");
    React.useEffect(() => {
        if (watchPhoto && watchPhoto instanceof File) {
        const url = URL.createObjectURL(watchPhoto);
        setPhotoPreview(url);
        return () => URL.revokeObjectURL(url);
        }
        setPhotoPreview(null);
    }, [watchPhoto]);

    async function onSubmit(values) {
        // Build JSON for extra_curriculars
        const extras = [
        ...(values.extra_curriculars_checked || []),
        ...(values.extra_curriculars_other?.trim() ? [values.extra_curriculars_other.trim()] : []),
        ];

        const fd = new FormData();
        fd.append("applicant", values.applicant);
        fd.append("apply_grade", values.apply_grade);
        fd.append("extra_curriculars", JSON.stringify(extras)); // Django JSONField

        if (values.photo) fd.append("photo", values.photo);
        if (values.birth_certificate) fd.append("birth_certificate", values.birth_certificate);
        if (values.health_record) fd.append("health_record", values.health_record);

        try {
        const res = await fetch(apiUrl, {
            method: "POST",
            body: fd,
            // If you use CSRF cookies + same-site, you may also add:
            // credentials: "include",
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || `Request failed with ${res.status}`);
        }

        toast.success("Application submitted", { description: "We received your details." });
        form.reset({ ...form.getValues(), apply_grade: "", extra_curriculars_checked: [], extra_curriculars_other: "", photo: undefined, birth_certificate: undefined, health_record: undefined });
        setPhotoPreview(null);
        } catch (e) {
        toast.error("Submit failed", { description: e.message });
        }
    }

    const EXTRA_OPTIONS = [
        "Sports", "Music", "Art", "Debate", "Scouts", "Coding Club",
    ];

    return (
        <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">New Application</h2>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Applicant (hidden if you infer from auth) */}
            <FormField
                control={form.control}
                name="applicant"
                render={({ field }) => (
                <FormItem className="hidden">
                    <FormLabel>Applicant</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Grade */}
            <FormField
                control={form.control}
                name="apply_grade"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Applying Grade</FormLabel>
                    <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                        {GRADES.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Extra Curriculars (JSONField) */}
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
                                    if (v) arr.add(label); else arr.delete(label);
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

            {/* Photo (ImageField) */}
            <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Photo (image ≤ {MAX_IMG_MB} MB)</FormLabel>
                    <FormControl>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                    </FormControl>
                    {photoPreview && (
                    <div className="mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoPreview} alt="Preview" className="h-32 rounded-lg object-cover" />
                    </div>
                    )}
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Birth certificate (FileField) */}
            <FormField
                control={form.control}
                name="birth_certificate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Birth Certificate (PDF/DOC/DOCX ≤ {MAX_DOC_MB} MB)</FormLabel>
                    <FormControl>
                    <Input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Health record (FileField) */}
            <FormField
                control={form.control}
                name="health_record"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Health Record (PDF/DOC/DOCX ≤ {MAX_DOC_MB} MB)</FormLabel>
                    <FormControl>
                    <Input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
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
