'use client';

import { useFormState } from 'react-dom';
import { useEffect, useState, useTransition } from 'react';
import { type Journal } from '@/lib/types';
import { type FormState, getAiSuggestionsAction } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2 } from 'lucide-react';

type JournalFormProps = {
  journal?: Journal | null;
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
};

export function JournalForm({ journal, action }: JournalFormProps) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(action, { message: '' });
  
  const [content, setContent] = useState(journal?.content || '');
  const [title, setTitle] = useState(journal?.title || '');
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAiLoading, startAiTransition] = useTransition();

  useEffect(() => {
    if (state.message && state.errors) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: state.message,
      });
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleGetSuggestions = () => {
    startAiTransition(async () => {
      const result = await getAiSuggestionsAction(content);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'AI Suggestion Error',
          description: result.error,
        });
        setSuggestions([]);
      } else {
        setSuggestions(result.suggestions);
      }
    });
  };

  return (
    <form action={formAction}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">{journal ? 'Edit Journal Entry' : 'Create New Journal Entry'}</CardTitle>
          <CardDescription>
            {journal ? 'Update your thoughts and experiences.' : 'Capture your thoughts and experiences.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <div className="flex flex-col sm:flex-row gap-2 items-start">
              <div className="flex-grow space-y-1">
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A title for your entry"
                  required
                  aria-invalid={!!state.errors?.title}
                  aria-describedby="title-error"
                />
                {state.errors?.title && <p id="title-error" className="text-sm text-destructive">{state.errors.title.join(', ')}</p>}
              </div>
              <Button type="button" variant="outline" onClick={handleGetSuggestions} disabled={isAiLoading || content.length < 50}>
                {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Suggest
              </Button>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <p className="text-sm text-muted-foreground w-full">Suggestions:</p>
                {suggestions.map((s, i) => (
                  <Button key={i} type="button" variant="secondary" size="sm" onClick={() => setTitle(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write what's on your mind..."
              className="min-h-[300px]"
              required
              aria-invalid={!!state.errors?.content}
              aria-describedby="content-error"
            />
            {state.errors?.content && <p id="content-error" className="text-sm text-destructive">{state.errors.content.join(', ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={journal?.tags.join(', ')}
              placeholder="e.g. work, reflection, travel"
              aria-invalid={!!state.errors?.tags}
              aria-describedby="tags-error"
            />
            <p className="text-sm text-muted-foreground">Separate tags with a comma.</p>
            {state.errors?.tags && <p id="tags-error" className="text-sm text-destructive">{state.errors.tags.join(', ')}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit">{journal ? 'Update Entry' : 'Create Entry'}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
