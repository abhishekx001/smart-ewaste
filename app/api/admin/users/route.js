import { supabase } from "@/utils/supabase";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const status = searchParams.get('status');

        let query = supabase.from('users').select('*').order('created_at', { ascending: false });

        if (role) {
            query = query.eq('role', role);
        }
        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ users: data || [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Fetching users error:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch users", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return new Response(JSON.stringify({ message: "ID and status are required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ status: status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ message: `User status updated to ${status}`, user: data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Update status error:", error);
        return new Response(JSON.stringify({ message: "Failed to update user status", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
