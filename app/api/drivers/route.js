import { supabase } from "@/utils/supabase";

export async function GET(request) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('user_id')
            .eq('role', 'driver');

        if (error) {
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ drivers: data || [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Fetching drivers error:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch drivers", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
