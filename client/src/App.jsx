import {
  CheckCircle2,
  ClipboardList,
  FolderPlus,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
  UserPlus
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const emptyAuth = { name: "", email: "", password: "", role: "Admin" };
const taskStatuses = ["To Do", "In Progress", "Done"];

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuth);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [projectForm, setProjectForm] = useState({ title: "", description: "", members: [] });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    deadline: "",
    status: "To Do"
  });

  const isAdmin = user?.role === "Admin";

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      const requests = [api.get("/projects"), api.get("/tasks"), api.get("/dashboard")];
      if (isAdmin) requests.push(api.get("/auth/members"));
      const [projectRes, taskRes, statsRes, memberRes] = await Promise.all(requests);
      setProjects(projectRes.data);
      setTasks(taskRes.data);
      setStats(statsRes.data);
      if (memberRes) setMembers(memberRes.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const projectMembers = useMemo(() => {
    const project = projects.find((item) => item._id === taskForm.projectId);
    return project?.members || [];
  }, [projects, taskForm.projectId]);

  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload =
        authMode === "signup"
          ? authForm
          : { email: authForm.email, password: authForm.password };
      const { data } = await api.post(`/auth/${authMode}`, payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setAuthForm(emptyAuth);
    } catch (error) {
      setMessage(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setProjects([]);
    setTasks([]);
    setStats({ total: 0, completed: 0, pending: 0, overdue: 0 });
  }

  async function createProject(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/projects", projectForm);
      setProjectForm({ title: "", description: "", members: [] });
      await loadData();
      setMessage("Project created successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Project creation failed");
    } finally {
      setLoading(false);
    }
  }

  async function createTask(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/tasks", taskForm);
      setTaskForm({
        title: "",
        description: "",
        projectId: "",
        assignedTo: "",
        deadline: "",
        status: "To Do"
      });
      await loadData();
      setMessage("Task assigned successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Task creation failed");
    } finally {
      setLoading(false);
    }
  }

  async function updateTaskStatus(taskId, status) {
    setLoading(true);
    setMessage("");

    try {
      await api.put(`/tasks/${taskId}`, { status });
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Status update failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleMember(memberId) {
    setProjectForm((current) => ({
      ...current,
      members: current.members.includes(memberId)
        ? current.members.filter((id) => id !== memberId)
        : [...current.members, memberId]
    }));
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-100 text-ink">
        <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-8 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">
              Trello Lite
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Mini Team Task Manager
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              Create projects, assign work, and track team progress with simple Admin and
              Member access.
            </p>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <Feature icon={LayoutDashboard} title="Dashboard" />
              <Feature icon={UserPlus} title="Teams" />
              <Feature icon={CheckCircle2} title="Tasks" />
            </div>
          </div>

          <form onSubmit={handleAuth} className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-5 flex rounded-md bg-slate-100 p-1">
              {["login", "signup"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuthMode(mode)}
                  className={`flex-1 rounded px-4 py-2 text-sm font-semibold capitalize ${
                    authMode === mode ? "bg-white text-brand shadow-sm" : "text-slate-500"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {authMode === "signup" && (
              <>
                <Input
                  label="Name"
                  value={authForm.name}
                  onChange={(value) => setAuthForm({ ...authForm, name: value })}
                />
                <label className="mb-4 block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Role</span>
                  <select
                    value={authForm.role}
                    onChange={(event) => setAuthForm({ ...authForm, role: event.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand"
                  >
                    <option>Admin</option>
                    <option>Member</option>
                  </select>
                </label>
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={authForm.email}
              onChange={(value) => setAuthForm({ ...authForm, email: value })}
            />
            <Input
              label="Password"
              type="password"
              value={authForm.password}
              onChange={(value) => setAuthForm({ ...authForm, password: value })}
            />

            {message && <p className="mb-4 text-sm font-medium text-red-600">{message}</p>}
            <button className="w-full rounded-md bg-brand px-4 py-2 font-semibold text-white transition hover:bg-blue-700">
              {loading ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-bold">Team Task Manager</h1>
            <p className="text-sm text-slate-500">
              {user.name} · {user.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6">
        {message && (
          <div className="mb-5 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
            {message}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title="Total Tasks" value={stats.total} icon={ClipboardList} />
          <Stat title="Completed" value={stats.completed} icon={CheckCircle2} />
          <Stat title="Pending" value={stats.pending} icon={ListTodo} />
          <Stat title="Overdue" value={stats.overdue} icon={LayoutDashboard} danger />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          {isAdmin && (
            <aside className="space-y-6">
              <Panel title="Create Project" icon={FolderPlus}>
                <form onSubmit={createProject}>
                  <Input
                    label="Project title"
                    value={projectForm.title}
                    onChange={(value) => setProjectForm({ ...projectForm, title: value })}
                  />
                  <Textarea
                    label="Description"
                    value={projectForm.description}
                    onChange={(value) =>
                      setProjectForm({ ...projectForm, description: value })
                    }
                  />
                  <p className="mb-2 text-sm font-medium text-slate-700">Members</p>
                  <div className="mb-4 max-h-36 space-y-2 overflow-auto rounded-md border border-slate-200 p-2">
                    {members
                      .filter((member) => member.role === "Member")
                      .map((member) => (
                        <label key={member._id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={projectForm.members.includes(member._id)}
                            onChange={() => toggleMember(member._id)}
                          />
                          <span>{member.name}</span>
                          <span className="text-slate-400">{member.email}</span>
                        </label>
                      ))}
                  </div>
                  <PrimaryButton loading={loading} icon={Plus}>
                    Create Project
                  </PrimaryButton>
                </form>
              </Panel>

              <Panel title="Assign Task" icon={Plus}>
                <form onSubmit={createTask}>
                  <Input
                    label="Task title"
                    value={taskForm.title}
                    onChange={(value) => setTaskForm({ ...taskForm, title: value })}
                  />
                  <Textarea
                    label="Description"
                    value={taskForm.description}
                    onChange={(value) => setTaskForm({ ...taskForm, description: value })}
                  />
                  <Select
                    label="Project"
                    value={taskForm.projectId}
                    onChange={(value) =>
                      setTaskForm({ ...taskForm, projectId: value, assignedTo: "" })
                    }
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Assign to"
                    value={taskForm.assignedTo}
                    onChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })}
                  >
                    <option value="">Select member</option>
                    {projectMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Deadline"
                    type="date"
                    value={taskForm.deadline}
                    onChange={(value) => setTaskForm({ ...taskForm, deadline: value })}
                  />
                  <PrimaryButton loading={loading} icon={Plus}>
                    Assign Task
                  </PrimaryButton>
                </form>
              </Panel>
            </aside>
          )}

          <section className="space-y-6">
            <Panel title="Projects" icon={FolderPlus}>
              <div className="grid gap-3 md:grid-cols-2">
                {projects.length === 0 && <EmptyState text="No projects yet" />}
                {projects.map((project) => (
                  <article key={project._id} className="rounded-lg border border-slate-200 p-4">
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{project.description}</p>
                    <p className="mt-3 text-sm text-slate-600">
                      {project.members.length} member{project.members.length === 1 ? "" : "s"}
                    </p>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel title={isAdmin ? "All Assigned Tasks" : "My Tasks"} icon={ClipboardList}>
              <div className="space-y-3">
                {tasks.length === 0 && <EmptyState text="No tasks found" />}
                {tasks.map((task) => (
                  <article
                    key={task._id}
                    className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_180px]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <StatusBadge status={task.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                        <span>{task.projectId?.title}</span>
                        <span>Assigned: {task.assignedTo?.name}</span>
                        <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Select
                      label="Status"
                      value={task.status}
                      onChange={(value) => updateTaskStatus(task._id, value)}
                    >
                      {taskStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </Select>
                  </article>
                ))}
              </div>
            </Panel>
          </section>
        </section>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <Icon className="mb-3 text-brand" size={22} />
      <p className="font-semibold">{title}</p>
    </div>
  );
}

function Stat({ title, value, icon: Icon, danger = false }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <Icon className={danger ? "text-red-500" : "text-brand"} size={20} />
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="text-brand" size={20} />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows="3"
        className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand"
      />
    </label>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand"
      >
        {children}
      </select>
    </label>
  );
}

function PrimaryButton({ loading, icon: Icon, children }) {
  return (
    <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 font-semibold text-white transition hover:bg-blue-700">
      <Icon size={16} />
      {loading ? "Please wait..." : children}
    </button>
  );
}

function StatusBadge({ status }) {
  const className =
    status === "Done"
      ? "bg-emerald-100 text-emerald-700"
      : status === "In Progress"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-700";

  return <span className={`rounded px-2 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

function EmptyState({ text }) {
  return <p className="rounded-md border border-dashed border-slate-300 p-5 text-center text-slate-500">{text}</p>;
}

export default App;
