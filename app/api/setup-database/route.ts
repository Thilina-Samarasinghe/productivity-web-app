import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Hardcoded Supabase credentials
const supabaseUrl = "https://tudhpxxevnjclrfqkgok.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZGhweHhldm5qY2xyZnFrZ29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MDIxMDEsImV4cCI6MjA1ODQ3ODEwMX0.v3V3U5Vo8LgKgf-D97SxEt9SddIswgFvY1KFKchaw44"

export async function GET() {
  try {
    // Initialize Supabase client with hardcoded credentials
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create tasks table
    try {
      console.log("Creating tasks table...")

      const { error } = await supabase.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
          status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'completed')),
          due_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks (user_id);
        CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks (status);
        CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks (priority);
      `)

      if (error) {
        console.error("Error creating tasks table:", error)
        throw error
      }

      console.log("Tasks table created successfully")
    } catch (error) {
      console.error("Error creating tasks table:", error)
      // Continue even if there's an error, as the table might already exist
    }

    // Create RLS policies
    try {
      console.log("Setting up RLS policies...")

      await supabase.query(`
        -- Enable Row Level Security
        ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY IF NOT EXISTS "Users can view their own tasks" 
          ON tasks FOR SELECT 
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own tasks" 
          ON tasks FOR INSERT 
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own tasks" 
          ON tasks FOR UPDATE 
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own tasks" 
          ON tasks FOR DELETE 
          USING (auth.uid() = user_id);
      `)

      console.log("RLS policies set up successfully")
    } catch (error) {
      console.error("Error setting up RLS policies:", error)
      // Continue even if there's an error, as the policies might already exist
    }

    return NextResponse.json({ success: true, message: "Database setup completed successfully" })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
