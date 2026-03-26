import { supabase } from "@/utils/supabase";

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, userDetails, binLocation, description, latitude, longitude, image_data } = body;

        if (!userId || !userDetails || !binLocation || !description) {
            return new Response(JSON.stringify({ message: "All required fields must be filled" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { data, error } = await supabase
            .from('complaints')
            .insert({
                user_id: userId,
                user_details: userDetails,
                bin_location: binLocation,
                description: description,
                status: 'pending',
                latitude: latitude || null,
                longitude: longitude || null,
                image_data: image_data || null
            })
            .select('*')
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ message: "Complaint submitted successfully", complaint: data }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Complaint error:", error);
        return new Response(JSON.stringify({ message: "Failed to submit complaint", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const role = searchParams.get('role');

        let query = supabase.from('complaints').select('*').order('created_at', { ascending: false });

        if (role !== 'admin') {
            if (!userId) {
                return new Response(JSON.stringify({ message: "User ID is required" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            if (role === 'driver') {
                query = query.eq('assigned_driver', userId);
            } else {
                query = query.eq('user_id', userId);
            }
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ complaints: data || [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Fetching complaints error:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch complaints", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, status, assigned_driver } = body;

        if (!id) {
            return new Response(JSON.stringify({ message: "Complaint ID is required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (assigned_driver !== undefined) updateData.assigned_driver = assigned_driver;

        const { data, error } = await supabase
            .from('complaints')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Response(JSON.stringify({ message: "Complaint status updated", complaint: data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Update complaint error:", error);
        return new Response(JSON.stringify({ message: "Failed to update complaint", error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
