import React from "react";

import { RegisterOptions, UseFormRegister } from 'react-hook-form'

interface InputProps {
    type: string
    placeholder: string
    name: string
    register: UseFormRegister<any>
    error?: string
    rules?: RegisterOptions
}

export function Input({ type, placeholder, name, register, error, rules }: InputProps) {
    return (
        <div>
            <input type={type} placeholder={placeholder} {...register(name, rules)} id={name} className="w-full border-2 rounded-md h-11 px-2" />
            {error && <p className="my-1 text-red-500 font-medium">{error}</p>}
        </div>
    )
}