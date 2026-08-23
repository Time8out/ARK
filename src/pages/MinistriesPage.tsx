import GroupsManager from '../components/GroupsManager'

function MinistriesPage() {
  return (
    <GroupsManager
      kind="ministry"
      title="Ministries"
      subtitle="Organize members into ministries"
      addLabel="Add Ministry"
    />
  )
}

export default MinistriesPage
