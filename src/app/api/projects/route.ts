// src/app/api/projects/route.ts

import { NextResponse } from 'next/server'
import { getAllProjects } from '@/data/projects/getAllProjects'

export async function GET() {
  const projects = await getAllProjects()
  return NextResponse.json(projects)
}
