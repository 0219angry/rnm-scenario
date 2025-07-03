import { NextResponse } from 'next/server';  
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';  
import { cookies } from 'next/headers';  

export async function POST(req: Request) {  
  const supabase = createRouteHandlerClient({ cookies });  
  const { data: { user } } = await supabase.auth.getUser();  

  if (!user) {  
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });  
  }  

  const { content, channelId } = await req.json();  

  if (!content || !channelId) {  
    return NextResponse.json({ error: 'Content and channelId are required' }, { status: 400 });  
  }  

  const { error } = await supabase  
    .from('messages')  
    .insert({ content, channelId, authorId: user.id });  

  if (error) {  
    return NextResponse.json({ error: error.message }, { status: 500 });  
  }  

  return NextResponse.json({ success: true }, { status: 201 });  
}  