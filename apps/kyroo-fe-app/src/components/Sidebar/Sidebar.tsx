// src/components/Sidebar/Sidebar.tsx
import { useEffect, useState } from "react";
import { getModulesByRole } from "../../utils/getModules";
import type { ModuleMeta } from "../../types/module";
import styles from "./Sidebar.module.scss";

type Props = {
  role: string;
};

const Sidebar = ({ role }: Props) => {
  const [modules, setModules] = useState<ModuleMeta[]>([]);

  useEffect(() => {
    getModulesByRole(role).then(setModules);
  }, [role]);

  return (
    <aside className={styles.sidebar}>
      <h3>Modules</h3>
      {modules.map((mod) => (
        <div key={mod.name} className={styles.moduleItem}>
          <mod.icon size={20} />
          <span>{mod.name}</span>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
