import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    Message,
    Project,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    get_datetime_utc,
)

router = APIRouter(tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
def get_projects(*, session: SessionDep) -> list[ProjectResponse]:
    statement = (
        select(Project).order_by(Project.sort_order.asc(), Project.created_at.desc())  # type: ignore[attr-defined]
    )
    projects = session.exec(statement).all()
    return [ProjectResponse.model_validate(p) for p in projects]


@router.post(
    "",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=ProjectResponse,
)
def create_project(
    *, session: SessionDep, project_in: ProjectCreate
) -> ProjectResponse:
    project = Project.model_validate(project_in)
    session.add(project)
    session.commit()
    session.refresh(project)
    return ProjectResponse.model_validate(project)


@router.put(
    "/{project_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=ProjectResponse,
)
def update_project(
    *, session: SessionDep, project_id: uuid.UUID, project_in: ProjectUpdate
) -> ProjectResponse:
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    project.updated_at = get_datetime_utc()

    session.add(project)
    session.commit()
    session.refresh(project)
    return ProjectResponse.model_validate(project)


@router.delete(
    "/{project_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_project(*, session: SessionDep, project_id: uuid.UUID) -> Message:
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return Message(message="Project deleted")
