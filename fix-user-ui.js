const fs = require('fs');

const path = './src/features/ayarlar/components/ayarlar-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. handleAddUser Fix
content = content.replace(
`  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      alert("Lütfen tüm alanları doldurun.")
      return
    }
    const res = await createUser(newUser)`,
`  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      alert("Lütfen tüm alanları doldurun.")
      return
    }
    const payload = { ...newUser, name: newUser.email }
    const res = await createUser(payload)`
);

// 2. handleSaveEdit Fix
content = content.replace(
`  const handleSaveEdit = async () => {
    const res = await updateUser(editingUserId!, editUserData)`,
`  const handleSaveEdit = async () => {
    const payload = { ...editUserData, name: editUserData.email }
    const res = await updateUser(editingUserId!, payload)`
);

// 3. Add User Form UI Fix
content = content.replace(
`                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Ad Soyad" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  <input type="email" placeholder="E-posta Adresi" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  <input type="password" placeholder="Şifre" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
                    <option value="USER">Standart Kullanıcı</option>
                    <option value="ADMIN">Yönetici</option>
                    <option value="SUPER_ADMIN">Süper Admin</option>
                  </select>`,
`                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Kullanıcı Adı" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  <input type="password" placeholder="Şifre" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
                    <option value="USER">Standart Kullanıcı</option>
                    <option value="ADMIN">Yönetici</option>
                    <option value="SUPER_ADMIN">Süper Admin</option>
                    <option value="VIEWER">Sadece İzleyici</option>
                  </select>`
);

// 4. Edit User Form UI Fix
content = content.replace(
`                      {editingUserId === u.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input type="text" value={editUserData.name} onChange={e => setEditUserData({...editUserData, name: e.target.value})} className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:border-sky-500" placeholder="Ad Soyad" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="email" value={editUserData.email} onChange={e => setEditUserData({...editUserData, email: e.target.value})} className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:border-sky-500" placeholder="E-posta" />
                          </td>`,
`                      {editingUserId === u.id ? (
                        <>
                          <td className="px-4 py-3" colSpan={2}>
                            <input type="text" value={editUserData.email} onChange={e => setEditUserData({...editUserData, email: e.target.value})} className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:border-sky-500" placeholder="Kullanıcı Adı" />
                          </td>`
);

content = content.replace(
`                            <select value={editUserData.role} onChange={e => setEditUserData({...editUserData, role: e.target.value})} className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:border-sky-500">
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            </select>`,
`                            <select value={editUserData.role} onChange={e => setEditUserData({...editUserData, role: e.target.value})} className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:border-sky-500">
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                              <option value="VIEWER">VIEWER</option>
                            </select>`
);


// 5. Table Header Fix
content = content.replace(
`                    <th className="px-4 py-3 text-xs font-bold text-neutral-500 bg-neutral-100 uppercase tracking-wider">Ad Soyad</th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-500 bg-neutral-100 uppercase tracking-wider">E-posta</th>`,
`                    <th className="px-4 py-3 text-xs font-bold text-neutral-500 bg-neutral-100 uppercase tracking-wider" colSpan={2}>Kullanıcı Adı</th>`
);

// 6. Table Body (View mode) Fix
content = content.replace(
`                          <td className="px-4 py-3 font-medium text-neutral-800">{u.name}</td>
                          <td className="px-4 py-3 text-neutral-600">{u.email}</td>`,
`                          <td className="px-4 py-3 font-medium text-neutral-800" colSpan={2}>{u.email}</td>`
);


fs.writeFileSync(path, content);
