
const Footer = () => {
    return (
        <footer className="p-4 pb-6 mt-auto flex-shrink-0">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-sm">&copy; 2025 BolsiVibe. Todos los derechos reservados.</p>
                    </div>
                    <div className="flex space-x-4">
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Términos y Condiciones
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Política de Privacidad
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Contacto
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;