import { supabase } from "@/utils/supabase";

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, password, role } = body;

        if (!userId || !password) {
            return new Response(JSON.stringify({ message: "User ID and password are required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const assignRole = role || 'user';
        let status = 'approved';

        // Basic check to prevent assigning admin roles directly from public register 
        if (assignRole === 'admin') {
            return new Response(JSON.stringify({ message: "Invalid role selected." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Drivers start as pending
        if (assignRole === 'driver') {
            status = 'pending';
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('users')
            .insert({ 
                user_id: userId, 
                password: password, 
                role: assignRole,
                status: status 
            })
            .select('*')
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation usually
                return new Response(JSON.stringify({ message: "User ID already exists." }), {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ message: "Registration successful", user: data }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Registration error:", error);
        return new Response(JSON.stringify({ message: "Registration failed", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
