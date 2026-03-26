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
        
        // Basic check to prevent assigning admin/driver roles directly from public register 
        // if we wanted to secure it, but for this generic registration we'll allow 'user'
        if (assignRole !== 'user') {
            return new Response(JSON.stringify({ message: "Invalid role selected." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('users')
            .insert({ user_id: userId, password: password, role: assignRole })
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
