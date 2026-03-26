import { supabase } from "@/utils/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        console.log("Request received");
        const { address, pincode, city, latitude, longitude } = await request.json();

        if (!address || !pincode || !city || !latitude || !longitude) {
            return NextResponse.json(
                { message: "All fields sent data are required" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('locations')
            .insert({ address, pincode, city, latitude, longitude });

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: "Location saved successfully" }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        let query = supabase.from('locations').select('*');

        if (status === 'pending') {
            // Null or pending both mean it's not collected yet
            query = query.neq('status', 'collected');
        } else if (status === 'collected') {
            query = query.eq('status', 'collected');
        }

        if (role === 'driver' && userId) {
            query = query.or(`assigned_driver.is.null,assigned_driver.eq.${userId}`);
        }

        const { data: locations, error } = await query;

        if (error) {
            throw error;
        }

        const formattedLocations = locations.map(loc => ({
            ...loc,
            _id: loc.id,
            geolocation: {
                latitude: loc.latitude,
                longitude: loc.longitude
            }
        }));

        return NextResponse.json({ locations: formattedLocations }, { status: 200 });
    } catch (error) {
        console.log("Error in GET /api/location:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, assigned_driver, status } = body;

        if (!id) {
            return NextResponse.json({ message: "Location ID required" }, { status: 400 });
        }

        const updates = {};
        if (assigned_driver !== undefined) updates.assigned_driver = assigned_driver;
        if (status !== undefined) updates.status = status;

        const { data: updatedLocation, error } = await supabase
            .from('locations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: "Location assigned successfully", location: updatedLocation }, { status: 200 });
    } catch (error) {
        console.log("Error in PATCH /api/location:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ message: "Location ID required" }, { status: 400 });
        }

        const { error } = await supabase
            .from('locations')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: "Location deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, address, city, pincode, latitude, longitude } = body;

        if (!id) {
            return NextResponse.json({ message: "Location ID required" }, { status: 400 });
        }

        const { data: updatedLocation, error } = await supabase
            .from('locations')
            .update({
                address,
                city,
                pincode,
                latitude,
                longitude
            })
            .eq('id', id)
            .select() // Return the updated record
            .single();

        if (error) {
            throw error;
        }

        if (!updatedLocation) {
            return NextResponse.json({ message: "Location not found" }, { status: 404 });
        }

        // Format response to match expected structure
        const formattedLocation = {
            ...updatedLocation,
            _id: updatedLocation.id,
            geolocation: {
                latitude: updatedLocation.latitude,
                longitude: updatedLocation.longitude
            }
        };

        return NextResponse.json({ message: "Location updated successfully", location: formattedLocation }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
