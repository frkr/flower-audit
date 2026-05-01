// Configuracao da rota de boas vindas

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Flower Audit" },
    { name: "description", content: "Flower Audit - Software de Auditoria" },
  ];
}

export {loader, action} from "../.server/welcome/welcome";

export default function Welcome({ loaderData }: Route.ComponentProps) {
}
