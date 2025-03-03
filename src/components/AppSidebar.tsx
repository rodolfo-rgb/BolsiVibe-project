import { AiOutlineTransaction } from 'react-icons/ai'
import { TbHomeFilled } from "react-icons/tb"
import { IoMdCash } from "react-icons/io"
import { MdCastForEducation } from "react-icons/md"
import { FaSignOutAlt } from "react-icons/fa"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../lib/auth"
import { useToast } from "./ui/use-toast"

const navigationItems = [
    {
        title: "Principal",
        url: "/",
        icon: TbHomeFilled,
    },
    {
        title: "Transacciones",
        url: "/transactions",
        icon: AiOutlineTransaction,
    },
    {
        title: "Presupuesto",
        url: "/budget",
        icon: IoMdCash,
    },
    {
        title: "Educación Financiera",
        url: "/education",
        icon: MdCastForEducation,
    },
]

export default function AppSidebar() {
    const location = useLocation()
    const { signOut } = useAuth()
    const { toast } = useToast()

    const handleSignOut = async () => {
        try {
            await signOut()
            toast({
                title: "Sesión cerrada",
                description: "Has cerrado sesión exitosamente.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cerrar la sesión.",
                variant: "destructive",
            })
        }
    }

    const isActive = (path: string) => {
        if (path === "/" && location.pathname === "/") return true
        if (path !== "/" && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <div className="fixed top-0 left-0 h-screen p-8 z-50">
            <aside className="bg-gradient-to-br from-gray-800 to-gray-900 h-[calc(100vh-64px)] w-72 rounded-xl overflow-hidden shadow-xl">
                <div className="relative border-b border-white/20">
                    <div className="flex items-center gap-4 py-6 px-8">
                        <span className="text-xl font-semibold">
                            <span className="text-blue-400">Bolsi</span>
                            <span className="text-white">Vibe</span>
                        </span>
                    </div>
                </div>

                <div className="m-4">
                    <ul className="mb-4 flex flex-col gap-1">
                        {navigationItems.map((item) => (
                            <li key={item.title}>
                                <Link
                                    to={item.url}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg w-full text-white hover:bg-white/10 active:bg-white/30 transition-all duration-200 ${isActive(item.url)
                                            ? "bg-white/10 shadow-md shadow-blue-900"
                                            : ""
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 text-inherit" />
                                    <span className="text-base font-medium">{item.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="mx-3.5 mt-4 mb-2">
                        <div className="border-t border-white/20"></div>
                    </div>

                    <ul className="mb-4 flex flex-col gap-1">
                        <li>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-4 px-4 py-3 rounded-lg w-full text-white hover:bg-white/10 active:bg-white/30 transition-all duration-200"
                            >
                                <FaSignOutAlt className="w-5 h-5 text-inherit" />
                                <span className="text-base font-medium">Cerrar sesión</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>
        </div>
    );
}