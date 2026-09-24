import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("MUVA: error capturado por el boundary raíz", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center bg-muva-dark p-6 text-center text-muva-cream"
          role="alert"
        >
          <img
            src="/images/muva-logo-footer.png"
            alt="MUVA"
            className="h-14 w-auto opacity-80"
            width={800}
            height={319}
          />
          <h1 className="mt-8 font-serif text-3xl font-light">
            Algo salió mal al cargar la página
          </h1>
          <p className="mt-4 max-w-md text-sm text-muva-cream/70">
            La experiencia 3D puede no estar disponible en este dispositivo o
            navegador. Podés reintentar o volver al inicio.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={this.handleRetry}
              className="border border-muva-cream/40 px-6 py-3 font-sans text-[11px] uppercase tracking-extra-wide transition-colors duration-300 hover:bg-muva-cream/10"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="border border-muva-cream/40 px-6 py-3 font-sans text-[11px] uppercase tracking-extra-wide transition-colors duration-300 hover:bg-muva-cream/10"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
