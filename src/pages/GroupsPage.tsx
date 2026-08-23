import GroupsManager from '../components/GroupsManager'

function GroupsPage() {
  return (
    <GroupsManager
      kind="group"
      title="Groups"
      subtitle="Organize members into small groups"
      addLabel="Add Group"
    />
  )
}

export default GroupsPage
