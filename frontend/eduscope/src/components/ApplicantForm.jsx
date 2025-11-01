"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast,Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Zod schema
const formSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, { message: "First name must be at least 2 characters." })
    .regex(/^[A-Za-z\s'-]+$/, {
      message:
        "First name can only contain letters, spaces, apostrophes, and hyphens.",
    }),
  last_name: z
    .string()
    .trim()
    .min(2, { message: "Last name must be at least 2 characters." })
    .regex(/^[A-Za-z\s'-]+$/, {
      message:
        "Last name can only contain letters, spaces, apostrophes, and hyphens.",
    }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender.",
  }),
  dob: z
    .string()
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      if (isNaN(dob.getTime())) return false;
      if (dob >= today) return false;

      const ageDiff = today.getFullYear() - dob.getFullYear();
      const hasBirthdayPassed =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() &&
          today.getDate() >= dob.getDate());
      const age = hasBirthdayPassed ? ageDiff : ageDiff - 1;
      return age >= 6;
    }, { message: "Minimum age must be 6 years." }),

  guardian_name: z
    .string()
    .trim()
    .min(2, { message: "Guardian name must be at least 2 characters." })
    .regex(/^[A-Za-z\s'-]+$/, {
      message:
        "Guardian name can only contain letters, spaces, apostrophes, and hyphens.",
    }),

  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email address." })
    .max(100, { message: "Email must be at most 100 characters." }),

  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, {
      message:
        "Enter a valid international number like +94771234567 (8–15 digits, no spaces).",
    })
    .max(20, { message: "Phone must be at most 20 characters." }),

  address: z
    .string()
    .trim()
    .min(5, { message: "Address must be at least 5 characters." }),
});

export default function ApplicantForm() {
  
  const [today, setToday] = React.useState("");
  React.useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
      gender: "",
      dob: "",
      guardian_name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (data) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}Applicant/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Applicant saved:", result);
    toast.success("Application Submitted!", {
      description: "Your application has been successfully sent.",
      duration: 4000,
    });

    form.reset();
  } catch (error) {
    console.error("❌ Error submitting applicant:", error);
    alert("Failed to submit applicant. Please try again.");
  }
};

  return (
    <div>
      <Toaster position="top-middle" richColors />
      {/* Header */}
      <div className="p-4 bg-white rounded-md shadow-md w-4xl justify-center mx-auto text-center border border-orange-400 mb-10">
        <h2 className="text-2xl text-orange-500 font-semibold">
          Add Student Details Form
        </h2>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type="text"
                      placeholder="John"
                      inputMode="text"
                      autoComplete="given-name"
                      pattern="^[A-Za-z\s'-]+$"
                      title="Only letters, spaces, apostrophes, and hyphens allowed"
                    />
                  </FormControl>
                  <FormDescription>Enter your legal first name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type="text"
                      placeholder="Wick"
                      inputMode="text"
                      autoComplete="family-name"
                      pattern="^[A-Za-z\s'-]+$"
                      title="Only letters, spaces, apostrophes, and hyphens allowed"
                    />
                  </FormControl>
                  <FormDescription>Enter your legal last name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormDescription>Select your gender.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* DOB */}
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="date"
                    placeholder="YYYY-MM-DD"
                    inputMode="numeric"
                    autoComplete="bday"
                    max={today || undefined}
                  />
                </FormControl>
                <FormDescription>Minimum age must be 6 years.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guardian Name */}
          <FormField
            control={form.control}
            name="guardian_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="text"
                    placeholder="Parent or Guardian"
                    inputMode="text"
                    pattern="^[A-Za-z\s'-]+$"
                    title="Only letters, spaces, apostrophes, and hyphens allowed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone (International E.164) */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (International)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="text"
                    inputMode="tel"
                    placeholder="+94771234567"
                    pattern="^\+[1-9]\d{7,14}$"
                    title="Use international format like +94771234567 (8–15 digits, no spaces or dashes)."
                    maxLength={20}
                  />
                </FormControl>
                <FormDescription>Format: + country code + number (no spaces).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="text"
                    placeholder="Street, City, Postal code"
                    autoComplete="street-address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" className="border border-orange-300 hover:bg-orange-100" onClick={() => form.reset()}>
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
