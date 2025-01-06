import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommitFormProps {
  branch: string | null
}

export default function CommitForm({ branch }: CommitFormProps) {
  const [commitMessage, setCommitMessage] = useState('')

  const handleCommit = () => {
    if (branch && commitMessage.trim()) {
      // Send commit data to API
      console.log(`Committing to branch ${branch}: ${commitMessage}`)
      // Reset form
      setCommitMessage('')
    }
  }

  return (
    <div className="p-4 mt-auto">
      <h2 className="text-xl font-bold mb-4">Commit Changes</h2>
      {branch ? (
        <>
          <Textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Enter commit message"
            className="mb-4"
          />
          <Button onClick={handleCommit} disabled={!commitMessage.trim()}>
            Commit to {branch}
          </Button>
        </>
      ) : (
        <p>Select a branch to commit changes</p>
      )}
    </div>
  )
}

