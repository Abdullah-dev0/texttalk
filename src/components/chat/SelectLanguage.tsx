"use client";

import { Globe } from "lucide-react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages } from "@/constant";

interface SelectLanguageProps {
	value?: string;
	onValueChange?: (value: string) => void;
}

export default function SelectLanguage({ value = "english", onValueChange }: SelectLanguageProps) {
	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger className="w-fit ring-0 focus:ring-0">
				<div className="flex items-center gap-1.5">
					<Globe className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium hidden sm:inline">Language:</span>
					<SelectValue className="capitalize" />
				</div>
			</SelectTrigger>
			<SelectContent align="end" className="min-w-[180px]">
				<SelectGroup>
					{languages.map((lang) => (
						<SelectItem key={lang.id} value={lang.language} className="capitalize text-sm">
							{lang.language}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
